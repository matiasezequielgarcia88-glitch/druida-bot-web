import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// Publica un comando MQTT a HiveMQ vía HTTP REST API.
// Las credenciales HiveMQ nunca salen del servidor.
export async function POST(request: NextRequest) {
  // 1. Verificar sesión Supabase
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Obtener el device_id del usuario desde la DB
  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('device_id')
    .eq('user_id', user.id)
    .single()

  if (deviceError || !device) {
    return NextResponse.json({ error: 'Dispositivo no encontrado' }, { status: 404 })
  }

  // 3. Parsear y validar el cuerpo del comando
  const body = await request.json().catch(() => null)
  if (!body?.subtopic || !body?.payload) {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  }

  // subtopic permitido: "relay" | "params"
  const ALLOWED = ['relay', 'params']
  if (!ALLOWED.includes(body.subtopic)) {
    return NextResponse.json({ error: 'Subtopic no permitido' }, { status: 400 })
  }

  const topic   = `druida/${device.device_id}/cmd/${body.subtopic}`
  const payload = Buffer.from(JSON.stringify(body.payload)).toString('base64')

  // 4. Publicar vía HiveMQ HTTP API
  const host = process.env.HIVEMQ_HOST!
  const auth = Buffer.from(`${process.env.HIVEMQ_USER}:${process.env.HIVEMQ_PASS}`).toString('base64')

  const res = await fetch(`https://${host}/api/v1/mqtt/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ topic, payload, qos: 1, retain: false }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[MQTT publish error]', res.status, text)
    return NextResponse.json({ error: 'Error publicando comando' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
