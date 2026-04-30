'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NoDevice() {
  const router = useRouter()
  const [open, setOpen]     = useState(false)
  const [code, setCode]     = useState('')
  const [name, setName]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLink(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res  = await fetch('/api/device/link', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code, name: name || undefined }),
    })
    const data = await res.json()

    if (!data.ok) {
      setError(data.error ?? 'Error al vincular el dispositivo')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-app)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Logo */}
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>
        DRUIDA <span style={{ color: 'var(--purple)' }}>BOT</span>
      </div>
      <div style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 48 }}>datadruida.com.ar</div>

      {!open ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
            No tenés ningún dispositivo vinculado
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 32, maxWidth: 320 }}>
            Conectá tu DruidaBot y presioná <strong>"Activar Dashboard"</strong> en la app local
            para obtener tu código de activación.
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              background: 'var(--purple)', color: '#fff', border: 'none',
              borderRadius: 12, padding: '14px 32px', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', letterSpacing: .3,
            }}
          >
            + Agregar Druida Bot
          </button>
        </div>
      ) : (
        <div className="auth-card" style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Agregar Druida Bot</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
            Ingresá el código que aparece en tu dispositivo.
          </div>

          <form onSubmit={handleLink}>
            <label className="cfg-label">Código de activación</label>
            <input
              type="text"
              className="code-input"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXXXX"
              maxLength={20}
              required
              autoFocus
            />

            <label className="cfg-label" style={{ marginTop: 14 }}>Nombre del dispositivo (opcional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Grow Room 1"
              maxLength={40}
            />

            {error && <div className="auth-error">{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                onClick={() => { setOpen(false); setError('') }}
                style={{
                  flex: 1, background: 'var(--bg-metric)', color: 'var(--text-2)',
                  border: '1px solid var(--border)', borderRadius: 10,
                  padding: '12px 0', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button type="submit" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Vinculando…' : 'Activar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginTop: 40, fontSize: 12, color: 'var(--text-3)' }}>
        druidadata@gmail.com · DataDruida
      </div>
    </div>
  )
}
