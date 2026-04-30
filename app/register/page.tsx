'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setInfo('')
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    if (password !== password2) { setError('Las contraseñas no coinciden'); return }

    setLoading(true)
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })

    if (signUpError) {
      setError(signUpError.message.includes('already') ? 'Ya existe una cuenta con ese email' : 'Error al crear la cuenta')
      setLoading(false)
      return
    }

    // Si el proyecto tiene email confirm deshabilitado, session ya existe
    if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      setInfo('Revisá tu email para confirmar la cuenta y luego ingresá.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">DRUIDA <span>BOT</span></div>
        <div className="auth-sub">Creá tu cuenta para controlar tu dispositivo.</div>

        {info ? (
          <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 10, background: 'rgba(52,199,89,.12)', color: 'var(--green)', fontSize: 14, lineHeight: 1.6 }}>
            {info}
            <div style={{ marginTop: 12 }}>
              <Link href="/login" style={{ color: 'var(--purple)', fontWeight: 600 }}>Ir al login →</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="cfg-label" htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />

            <label className="cfg-label" htmlFor="password">Contraseña</label>
            <input id="password" type="password" autoComplete="new-password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required />

            <label className="cfg-label" htmlFor="password2">Repetir contraseña</label>
            <input id="password2" type="password" autoComplete="new-password" value={password2}
              onChange={e => setPassword2(e.target.value)} placeholder="Repetí la contraseña" required />

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" disabled={loading} style={{ marginTop: 20 }}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--purple)', fontWeight: 600 }}>Ingresar</Link>
        </div>
      </div>
    </div>
  )
}
