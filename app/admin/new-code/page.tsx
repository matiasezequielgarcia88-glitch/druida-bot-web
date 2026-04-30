'use client'

import { useState } from 'react'

export default function NewCodePage() {
  const [mac, setMac]         = useState('')
  const [result, setResult]   = useState<{ ok: boolean; code?: string; device_id?: string; reused?: boolean; msg?: string; error?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    setLoading(true)

    const res  = await fetch('/api/admin/create-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mac }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div>
      <h2 style={{ marginBottom: 8, fontSize: 20, fontWeight: 700 }}>Generar código de producto</h2>
      <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 24 }}>
        Ingresá la MAC address del ESP32. Se genera el Device ID y el código de activación para entregar al cliente.
      </p>

      <div className="auth-card" style={{ maxWidth: 420 }}>
        <form onSubmit={handleSubmit}>
          <label className="cfg-label">MAC Address del ESP32</label>
          <input
            type="text"
            value={mac}
            onChange={e => setMac(e.target.value)}
            placeholder="AA:BB:CC:DD:EE:FF"
            maxLength={17}
            required
            style={{ fontFamily: 'monospace', letterSpacing: 1 }}
          />
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
            Se muestra en el monitor serie al bootear el ESP32 (línea [ID] Device ID:).
          </p>

          {result && result.ok && (
            <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, background: 'var(--bg-metric)', border: '1px solid var(--border)' }}>
              {result.reused && <p style={{ color: 'var(--yellow)', fontSize: 12, marginBottom: 8 }}>⚠️ Este dispositivo ya tenía un código asignado.</p>}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: .5 }}>Código de activación</div>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 3, color: 'var(--text-1)', fontFamily: 'monospace' }}>{result.code}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: .5 }}>Device ID (interno)</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'monospace' }}>{result.device_id}</div>
              </div>
            </div>
          )}

          {result && !result.ok && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,69,58,.12)', color: 'var(--red)', fontSize: 13 }}>
              ❌ {result.error ?? result.msg}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? 'Generando…' : 'Generar código'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 32, padding: '16px 20px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-2)' }}>
        <strong style={{ color: 'var(--text-1)', display: 'block', marginBottom: 8 }}>¿Cómo obtener la MAC del ESP32?</strong>
        <ol style={{ paddingLeft: 18, lineHeight: 2 }}>
          <li>Flashear el firmware DruidaBot 3.2</li>
          <li>Abrir el monitor serie (115200 baud)</li>
          <li>Al bootear verás: <code style={{ background: 'var(--bg-metric)', padding: '1px 6px', borderRadius: 4 }}>[ID] Device ID: druida_aabbccddeeff</code></li>
          <li>Ingresar la MAC en este formulario</li>
        </ol>
      </div>
    </div>
  )
}
