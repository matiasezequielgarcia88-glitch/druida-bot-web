import { createClient } from '@/lib/supabase-server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function macToDeviceId(mac: string): string {
  // Acepta: AA:BB:CC:DD:EE:FF  o  AABBCCDDEEFF
  const clean = mac.replace(/[:\-\s]/g, '').toLowerCase()
  if (!/^[0-9a-f]{12}$/.test(clean)) throw new Error('MAC inválida')
  return `druida_${clean}`
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `DRUID-${rand(4)}-${rand(2)}`
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const mac: string = (body?.mac ?? '').trim()

  let deviceId: string
  try {
    deviceId = macToDeviceId(mac)
  } catch {
    return NextResponse.json({ error: 'MAC address inválida (ej: AA:BB:CC:DD:EE:FF)' }, { status: 400 })
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check if device_id already has a code
  const { data: existing } = await admin.from('product_codes').select('code').eq('device_id', deviceId).single()
  if (existing) return NextResponse.json({ ok: true, code: existing.code, device_id: deviceId, reused: true })

  // Generate unique code
  let code = ''
  for (let attempt = 0; attempt < 10; attempt++) {
    code = generateCode()
    const { data: clash } = await admin.from('product_codes').select('code').eq('code', code).single()
    if (!clash) break
  }

  const { error: insertErr } = await admin.from('product_codes').insert({ code, device_id: deviceId })
  if (insertErr) return NextResponse.json({ error: 'Error al crear código' }, { status: 500 })

  return NextResponse.json({ ok: true, code, device_id: deviceId, reused: false })
}
