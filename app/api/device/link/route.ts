import { createClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const code: string = (body?.code ?? '').trim().toUpperCase()
  const name: string = (body?.name ?? 'Mi DruidaBot').trim()

  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  // Usar service_role key para llamar a la función que bypasea RLS
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await admin.rpc('link_device', {
    p_code:    code,
    p_user_id: user.id,
    p_name:    name,
  })

  if (error) {
    console.error('[link_device]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }

  if (!data.ok) {
    return NextResponse.json({ error: data.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true, device_id: data.device_id, name: data.name })
}
