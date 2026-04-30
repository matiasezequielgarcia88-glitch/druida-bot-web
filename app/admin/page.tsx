'use client'

import { useEffect, useState } from 'react'

type UserRow = {
  id: string
  email: string
  role: string
  must_change_password: boolean
  device: { device_id: string; name: string; code: string } | null
}

export default function AdminUsersPage() {
  const [users, setUsers]   = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => { setUsers(d); setLoading(false) })
  }, [])

  if (loading) return <div style={{ color: 'var(--text-2)', padding: 40 }}>Cargando…</div>

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 700 }}>Usuarios registrados</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-2)', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>Email</th>
            <th style={{ padding: '8px 12px' }}>Rol</th>
            <th style={{ padding: '8px 12px' }}>Dispositivo</th>
            <th style={{ padding: '8px 12px' }}>Código</th>
            <th style={{ padding: '8px 12px' }}>PW temp.</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '10px 12px' }}>{u.email}</td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{
                  background: u.role === 'admin' ? 'var(--purple)' : 'var(--bg-metric)',
                  color: u.role === 'admin' ? '#fff' : 'var(--text-2)',
                  borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                }}>{u.role}</span>
              </td>
              <td style={{ padding: '10px 12px', color: 'var(--text-2)', fontFamily: 'monospace', fontSize: 11 }}>
                {u.device ? `${u.device.name} (${u.device.device_id})` : '—'}
              </td>
              <td style={{ padding: '10px 12px', fontFamily: 'monospace', letterSpacing: 1 }}>
                {u.device?.code ?? '—'}
              </td>
              <td style={{ padding: '10px 12px' }}>
                {u.must_change_password
                  ? <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>Pendiente</span>
                  : <span style={{ color: 'var(--green)' }}>OK</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
