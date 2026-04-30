import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-1)' }}>
      <div style={{
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', display: 'flex', alignItems: 'center', gap: 24, height: 56,
      }}>
        <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--purple)' }}>DRUIDA</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-2)' }}>Panel Administrador</span>
        <div style={{ flex: 1 }} />
        <a href="/admin" style={{ color: 'var(--text-2)', fontSize: 13, textDecoration: 'none' }}>Usuarios</a>
        <a href="/admin/new-user" style={{ color: 'var(--text-2)', fontSize: 13, textDecoration: 'none' }}>+ Usuario</a>
        <a href="/admin/new-code" style={{ color: 'var(--text-2)', fontSize: 13, textDecoration: 'none' }}>+ Código</a>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </div>
    </div>
  )
}
