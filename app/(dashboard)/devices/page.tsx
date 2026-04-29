'use client'

import { useState } from 'react'
import { useDevice } from '@/components/DashboardShell'

const RELAY_ICONS: Record<number, string> = {
  1:'💦',2:'💨',3:'🚿',4:'☀️',5:'❄️',6:'🔥',7:'💡',8:'🚿',
}
const RELAY_NAMES: Record<number, string> = {
  1:'Humidificación',2:'Extracción',3:'Irrigación 1',4:'Iluminación 1',
  5:'Aire Acondicionado',6:'Calefacción',7:'Iluminación 2',8:'Irrigación 2',
}

type Mode = 'auto' | 'manual' | 'timer'

async function sendCmd(subtopic: string, payload: object) {
  await fetch('/api/cmd', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ subtopic, payload }),
  })
}

export default function DevicesPage() {
  const { state } = useDevice()
  const [localModes, setLocalModes] = useState<Record<number, Mode>>({})
  const [toast, setToast]           = useState<{ msg: string; err?: boolean } | null>(null)
  const [saving, setSaving]         = useState<number | null>(null)

  function showToast(msg: string, err = false) {
    setToast({ msg, err })
    setTimeout(() => setToast(null), 1800)
  }

  function getMode(idx: number): Mode {
    return localModes[idx] ?? (state.relays[`r${idx}`]?.modeKind ?? 'auto')
  }

  function setMode(idx: number, mode: Mode) {
    setLocalModes(prev => ({ ...prev, [idx]: mode }))
  }

  async function saveRelay(idx: number, extra: object = {}) {
    setSaving(idx)
    await sendCmd('relay', { n: idx, mode: getMode(idx), ...extra })
    showToast('Guardado')
    setSaving(null)
  }

  return (
    <div className="page">
      <div className="section-label">Modo por dispositivo</div>

      <div className="relays-list">
        {Array.from({ length: 8 }, (_, i) => {
          const idx  = i + 1
          const r    = state.relays[`r${idx}`]
          const on   = r?.on ?? false
          const mode = getMode(idx)

          return (
            <div key={idx} className={`relay-card${on ? ' is-on' : ''}`}>
              <div className="relay-header">
                <div className="relay-left">
                  <div className="relay-icon">{RELAY_ICONS[idx]}</div>
                  <div>
                    <div className="relay-name">
                      {r?.name || RELAY_NAMES[idx]}
                      <span style={{ opacity: .4, fontWeight: 500 }}> · R{idx}</span>
                    </div>
                    <div className="relay-status">
                      {on ? 'Encendido' : 'Apagado'} · {mode}
                    </div>
                  </div>
                </div>
                <span className={`relay-state-dot${on ? ' on' : ''}`} />
              </div>

              {/* Selector de modo */}
              <div className="mode-selector">
                {(['auto','manual','timer'] as Mode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`mode-btn${mode === m ? ' sel' : ''}`}
                    onClick={() => setMode(idx, m)}
                  >
                    {m === 'auto' ? 'Auto' : m === 'manual' ? 'Manual' : 'Timer'}
                  </button>
                ))}
              </div>

              {/* Extra según modo */}
              {mode === 'manual' && (
                <div className="mode-extra">
                  <div className="manual-actions">
                    <button
                      type="button"
                      className="btn-on"
                      disabled={saving === idx}
                      onClick={() => saveRelay(idx, { on: true })}
                    >
                      ENCENDER
                    </button>
                    <button
                      type="button"
                      className="btn-off"
                      disabled={saving === idx}
                      onClick={() => saveRelay(idx, { on: false })}
                    >
                      APAGAR
                    </button>
                  </div>
                </div>
              )}

              {mode === 'timer' && (
                <div className="mode-extra">
                  <div className="timer-grid">
                    <div className="timer-box">
                      <div className="timer-label">Encendido</div>
                      <input
                        type="time"
                        defaultValue={r?.onTime ?? '06:00'}
                        onChange={e => saveRelay(idx, { onTime: e.target.value })}
                      />
                    </div>
                    <div className="timer-box">
                      <div className="timer-label">Apagado</div>
                      <input
                        type="time"
                        defaultValue={r?.offTime ?? '22:00'}
                        onChange={e => saveRelay(idx, { offTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {mode === 'auto' && (
                <div className="mode-extra">
                  <div className="mode-hint">
                    Controlado automáticamente según los parámetros configurados.
                  </div>
                </div>
              )}

              {(mode !== 'manual') && (
                <button
                  type="button"
                  className="btn-save"
                  style={{ marginTop: 12 }}
                  disabled={saving === idx}
                  onClick={() => saveRelay(idx)}
                >
                  {saving === idx ? 'Guardando…' : 'Guardar modo'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {toast && (
        <div className={`toast show${toast.err ? ' err' : ''}`}>{toast.msg}</div>
      )}
    </div>
  )
}
