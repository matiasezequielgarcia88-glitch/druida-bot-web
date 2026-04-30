import { createClient } from '@/lib/supabase-server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all users with their profiles and devices
  const { data: rows } = await admin
    .from('profiles')
    .select('id, role, must_change_password, devices(device_id, name, code)')

  // Get emails from auth — fetch user list
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers()

  const emailMap: Record<string, string> = {}
  authUsers.forEach(u => { emailMap[u.id] = u.email ?? '' })

  const result = (rows ?? []).map(r => ({
    id: r.id,
    email: emailMap[r.id] ?? '',
    role: r.role,
    must_change_password: r.must_change_password,
    device: Array.isArray(r.devices) ? r.devices[0] ?? null : r.devices ?? null,
  }))

  return NextResponse.json(result)
}
