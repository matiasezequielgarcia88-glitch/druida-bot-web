'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const router  = useRouter()
  const [pw, setPw]         = useState('')
  const [pw2, setPw2]       = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (pw.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    if (pw !== pw2)    { setError('Las contraseñas no coinciden'); return }

    setLoading(true)
    const supabase = createClient()

    const { error: pwErr } = await supabase.auth.updateUser({ password: pw })
    if (pwErr) { setError('Error al cambiar la contraseña'); setLoading(false); return }

    // Marcar must_change_password = false
    await supabase.from('profiles').update({ must_change_password: false }).eq('id', (await supabase.auth.getUser()).data.user!.id)

    router.push('/')
    router.refresh()
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">DRUIDA <span>BOT</span></div>
        <div className="auth-sub">Por seguridad, elegí una nueva contraseña antes de continuar.</div>

        <form onSubmit={handleSubmit}>
          <label className="cfg-label" htmlFor="pw">Nueva contraseña</label>
          <input
            id="pw"
            type="password"
            autoComplete="new-password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
          />

          <label className="cfg-label" htmlFor="pw2">Repetir contraseña</label>
          <input
            id="pw2"
            type="password"
            autoComplete="new-password"
            value={pw2}
            onChange={e => setPw2(e.target.value)}
            placeholder="Repetí la contraseña"
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
