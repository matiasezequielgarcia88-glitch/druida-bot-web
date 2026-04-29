'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router  = useRouter()
  const [code, setCode]     = useState('')
  const [name, setName]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/device/link', {
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
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">DRUIDA <span>BOT</span></div>
        <div className="auth-sub">
          Ingresá el código que recibiste con tu dispositivo para vincularlo a tu cuenta.
        </div>

        <form onSubmit={handleSubmit}>
          <label className="cfg-label" htmlFor="code">Código de producto</label>
          <input
            id="code"
            type="text"
            className="code-input"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="DRUID-XXXX-XX"
            maxLength={14}
            required
          />

          <label className="cfg-label" htmlFor="name">Nombre del dispositivo (opcional)</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Grow Room 1"
            maxLength={40}
          />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? 'Verificando…' : 'Activar dispositivo'}
          </button>
        </form>
      </div>
    </div>
  )
}
