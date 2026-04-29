'use client'

import { useState } from 'react'
import { useDevice } from '@/components/DashboardShell'
import type { ParamsState } from '@/hooks/useMqtt'

async function sendParams(payload: Partial<ParamsState>) {
  await fetch('/api/cmd', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ subtopic: 'params', payload }),
  })
}

function QuadSlider({
  label, icon, keys, values, min, max, step, unit, fills,
  onChange,
}: {
  label: string; icon: string
  keys:   [string, string, string, string]
  values: [number, number, number, number]
  min: number; max: number; step: number; unit: string
  fills: { cold: [string,string]; hot: [string,string] }
  onChange: (key: string, val: number) => void
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100

  return (
    <div className="card">
      <div className="card-title-row">
        <span>{icon}</span>
        <div className="card-title">{label}</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 8px', marginBottom:14 }}>
        {keys.map((k, i) => (
          <div key={k} style={{ textAlign: i % 2 === 1 ? 'right' : 'left' }}>
            <div style={{ fontSize:10, fontWeight:600, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.4px' }}>
              {fills[i < 2 ? 'cold' : 'hot'][i % 2]}
            </div>
            <div style={{ fontSize:18, fontWeight:800, color:'var(--text-1)' }}>
              {values[i].toFixed(step < 1 ? 1 : 0)}{unit}
            </div>
          </div>
        ))}
      </div>

      <div style={{ position:'relative', height:36, display:'flex', alignItems:'center' }}>
        {/* Track */}
        <div style={{
          position:'absolute', left:10, right:10, height:5,
          background:'var(--bg-metric)', borderRadius:3,
        }}>
          <div style={{
            position:'absolute', height:'100%', background:'var(--green)',
            borderRadius:3, left:`${pct(values[0])}%`, width:`${pct(values[1])-pct(values[0])}%`,
          }} />
          <div style={{
            position:'absolute', height:'100%', background:'var(--red)',
            borderRadius:3, left:`${pct(values[2])}%`, width:`${pct(values[3])-pct(values[2])}%`,
          }} />
        </div>
        {keys.map((k, i) => (
          <input
            key={k}
            type="range"
            min={min} max={max} step={step}
            value={values[i]}
            style={{ position:'absolute', width:'100%', background:'transparent', border:'none', zIndex: i + 2 }}
            onChange={e => onChange(k, parseFloat(e.target.value))}
          />
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-3)', marginTop:4 }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function ParamsPage() {
  const { state }       = useDevice()
  const [local, setLocal] = useState<Partial<ParamsState>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState('')

  const p: ParamsState = { ...state.params, ...local }

  function update(key: string, val: number) {
    setLocal(prev => ({ ...prev, [key]: val }))
  }

  async function save() {
    setSaving(true)
    await sendParams(local)
    setToast('Parámetros guardados')
    setTimeout(() => setToast(''), 1800)
    setSaving(false)
  }

  return (
    <div className="page">
      <QuadSlider
        label="Temperatura" icon="🌡️"
        keys={['tempHeaterOn','tempHeaterOff','tempAcOff','tempAcOn']}
        values={[p.tempHeaterOn, p.tempHeaterOff, p.tempAcOff, p.tempAcOn]}
        min={5} max={45} step={0.5} unit="°C"
        fills={{ cold:['▼ Calef. ON','Calef. OFF'], hot:['A/C OFF','▲ A/C ON'] }}
        onChange={update}
      />

      <QuadSlider
        label="Humedad relativa" icon="💧"
        keys={['humHumidOn','humHumidOff','humDehumOff','humDehumOn']}
        values={[p.humHumidOn, p.humHumidOff, p.humDehumOff, p.humDehumOn]}
        min={20} max={98} step={1} unit="%"
        fills={{ cold:['▼ Humidif. ON','Humidif. OFF'], hot:['Deshumid. OFF','▲ Deshumid. ON'] }}
        onChange={update}
      />

      <button
        type="button"
        className="btn-save"
        disabled={saving || Object.keys(local).length === 0}
        onClick={save}
      >
        {saving ? 'Guardando…' : 'Guardar parámetros'}
      </button>

      {toast && <div className="toast show">{toast}</div>}
    </div>
  )
}
