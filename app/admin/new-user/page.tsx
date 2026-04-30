'use client'

import { useState } from 'react'

export default function NewUserPage() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult]   = useState<{ ok: boolean; msg: string } | null>(null)
  const [loading, setLoading] = useState(false)

  function generatePassword() {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#'
    setPassword(Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    setLoading(true)

    const res  = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setResult(data.ok
      ? { ok: true,  msg: `✅ Usuario creado: ${data.email}` }
      : { ok: false, msg: `❌ ${data.error}` }
    )
    if (data.ok) { setEmail(''); setPassword('') }
    setLoading(false)
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 700 }}>Crear usuario</h2>
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <form onSubmit={handleSubmit}>
          <label className="cfg-label">Email del cliente</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@email.com" required />

          <label className="cfg-label" style={{ marginTop: 16 }}>Contraseña temporal</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required style={{ flex: 1 }}
            />
            <button type="button" onClick={generatePassword}
              style={{ padding: '0 14px', background: 'var(--bg-metric)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
              Generar
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
            El usuario deberá cambiarla al primer ingreso.
          </p>

          {result && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13,
              background: result.ok ? 'rgba(52,199,89,.12)' : 'rgba(255,69,58,.12)',
              color: result.ok ? 'var(--green)' : 'var(--red)',
            }}>{result.msg}</div>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? 'Creando…' : 'Crear usuario'}
          </button>
        </form>
      </div>
    </div>
  )
}
