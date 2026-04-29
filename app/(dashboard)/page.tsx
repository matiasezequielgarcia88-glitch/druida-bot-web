'use client'

import { useDevice } from '@/components/DashboardShell'

const RELAY_ICONS: Record<number, string> = {
  1:'💦',2:'💨',3:'🚿',4:'☀️',5:'❄️',6:'🔥',7:'💡',8:'🚿',
}
const RELAY_NAMES: Record<number, string> = {
  1:'Humidificación',2:'Extracción',3:'Irrigación 1',4:'Iluminación 1',
  5:'Aire Acondicionado',6:'Calefacción',7:'Iluminación 2',8:'Irrigación 2',
}

function vpdLabel(v: number | null) {
  if (v === null) return { text: '', cls: '' }
  if (v < 0.4)       return { text: 'Muy bajo', cls: 'low' }
  if (v < 0.8)       return { text: 'Bajo',     cls: 'moderate' }
  if (v <= 1.2)      return { text: 'Óptimo',   cls: 'optimal' }
  if (v <= 1.6)      return { text: 'Moderado', cls: 'moderate' }
  return               { text: 'Alto',     cls: 'high' }
}

function fmt(v: number | null, suffix: string, decimals = 1) {
  if (v === null) return '--'
  return v.toFixed(decimals) + suffix
}

export default function DashboardPage() {
  const { state } = useDevice()
  const vpd = vpdLabel(state.dpv)

  return (
    <div className="page" style={{ gap: 10, padding: '10px 10px 24px' }}>

      {/* Sensor strip */}
      <div className="card dash-sensor">
        <div className="metrics-strip">
          <div className="mc mc--temp">
            <div className="mc-label">🌡️ Temperatura</div>
            <div className="mc-value">
              <span>{fmt(state.temp, '')}</span>
              <span className="mc-unit">°C</span>
            </div>
          </div>

          <div className="mc-vsep" />

          <div className="mc mc--hum">
            <div className="mc-label">💧 Humedad</div>
            <div className="mc-value">
              <span>{fmt(state.hum, '', 0)}</span>
              <span className="mc-unit">%</span>
            </div>
          </div>

          <div className="mc-vsep" />

          <div className="mc mc--vpd">
            <div className="mc-label">📊 VPD</div>
            <div className="mc-value mc-value--sm">
              <span>{fmt(state.dpv, '')}</span>
              <span className="mc-unit">kPa</span>
            </div>
            {vpd.text && <div className={`vpd-badge ${vpd.cls}`}>{vpd.text}</div>}
          </div>
        </div>
      </div>

      {/* Relay grid */}
      <div className="relay-section">
        <div className="section-label">Dispositivos</div>
        <div className="relay-btn-grid">
          {Array.from({ length: 8 }, (_, i) => {
            const idx = i + 1
            const r   = state.relays[`r${idx}`]
            const on  = r?.on ?? false
            return (
              <div key={idx} className={`relay-btn${on ? ' is-on' : ''}`}>
                <span className={`relay-btn-dot${on ? ' on' : ''}`} />
                <span className="relay-btn-icon">{RELAY_ICONS[idx]}</span>
                <span className="relay-btn-name">
                  {r?.name || RELAY_NAMES[idx]}
                </span>
                <span className="relay-btn-mode">
                  {r?.modeKind ?? 'auto'}
                </span>
              </div>
            )
          })}
          {/* celda vacía para completar 3×3 */}
          <div className="relay-btn" style={{ opacity: 0, pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  )
}
