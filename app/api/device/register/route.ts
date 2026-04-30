/**
 * POST /api/device/register
 * Called by the ESP32 (no user auth required).
 * Registers an activation code linked to a device_id.
 */
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const device_id: string = (body?.device_id ?? '').trim()
  const code: string      = (body?.code ?? '').trim().toUpperCase()

  if (!device_id || !code) {
    return NextResponse.json({ error: 'device_id y code requeridos' }, { status: 400 })
  }

  // Basic format validation
  if (!/^druida_[0-9a-f]{12}$/.test(device_id)) {
    return NextResponse.json({ error: 'device_id inválido' }, { status: 400 })
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await admin
    .from('activation_codes')
    .upsert({ device_id, code }, { onConflict: 'device_id', ignoreDuplicates: false })

  if (error) {
    console.error('[device/register]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }

  console.log(`[device/register] Dispositivo registrado: ${device_id} → ${code}`)
  return NextResponse.json({ ok: true })
}
