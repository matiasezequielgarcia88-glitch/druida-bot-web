import { createClient } from '@/lib/supabase-server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const email: string    = (body?.email ?? '').trim().toLowerCase()
  const password: string = (body?.password ?? '').trim()

  if (!email || !password) return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: 'Contraseña mínimo 8 caracteres' }, { status: 400 })

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Create user
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createErr) {
    const msg = createErr.message.includes('already') ? 'Ya existe un usuario con ese email' : 'Error al crear usuario'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Create profile — admin-created users don't need to change password
  await admin.from('profiles').upsert({
    id: created.user!.id,
    role: 'user',
    must_change_password: true,
  })

  return NextResponse.json({ ok: true, id: created.user!.id, email })
}
