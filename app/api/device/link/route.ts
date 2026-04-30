import { createClient } from '@/lib/supabase-server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const code: string = (body?.code ?? '').trim().toUpperCase()
  const name: string = (body?.name ?? 'Mi DruidaBot').trim()

  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check user doesn't already have a device
  const { data: existing } = await admin.from('devices').select('id').eq('user_id', user.id).single()
  if (existing) return NextResponse.json({ error: 'Ya tenés un dispositivo vinculado' }, { status: 400 })

  // Look up activation code
  const { data: ac, error: acErr } = await admin
    .from('activation_codes')
    .select('device_id, claimed_by')
    .eq('code', code)
    .single()

  if (acErr || !ac) return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
  if (ac.claimed_by) return NextResponse.json({ error: 'Este código ya fue utilizado' }, { status: 400 })

  // Link: insert device + mark code as claimed
  const { error: devErr } = await admin.from('devices').insert({
    user_id:   user.id,
    device_id: ac.device_id,
    name,
    code,
  })

  if (devErr) {
    console.error('[device/link]', devErr)
    return NextResponse.json({ error: 'Error al vincular el dispositivo' }, { status: 500 })
  }

  await admin.from('activation_codes').update({
    claimed_by: user.id,
    claimed_at: new Date().toISOString(),
  }).eq('code', code)

  return NextResponse.json({ ok: true, device_id: ac.device_id, name })
}
