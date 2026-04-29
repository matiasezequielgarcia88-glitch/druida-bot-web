'use client'

import { useEffect, useRef, useState } from 'react'

export interface DeviceState {
  temp:   number | null
  hum:    number | null
  dpv:    number | null
  relays: Record<string, RelayState>
  params: ParamsState
}

export interface RelayState {
  on:       boolean
  modeKind: 'auto' | 'manual' | 'timer'
  onTime:   string
  offTime:  string
  name:     string
  idx:      number
}

export interface ParamsState {
  tempHeaterOn:  number
  tempHeaterOff: number
  tempAcOff:     number
  tempAcOn:      number
  humHumidOn:    number
  humHumidOff:   number
  humDehumOff:   number
  humDehumOn:    number
  acRelay:       number
  heaterRelay:   number
  humidRelay:    number
  dehumidRelay:  number
}

const DEFAULT_STATE: DeviceState = {
  temp: null, hum: null, dpv: null,
  relays: {},
  params: {
    tempHeaterOn: 18, tempHeaterOff: 22, tempAcOff: 25, tempAcOn: 28,
    humHumidOn: 40,  humHumidOff: 55,  humDehumOff: 65, humDehumOn: 75,
    acRelay: 5, heaterRelay: 6, humidRelay: 1, dehumidRelay: 2,
  },
}

export function useMqtt(deviceId: string | null) {
  const [state, setState] = useState<DeviceState>(DEFAULT_STATE)
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<import('mqtt').MqttClient | null>(null)

  useEffect(() => {
    if (!deviceId) return

    let cancelled = false

    async function connect() {
      const mqtt = (await import('mqtt')).default

      const host    = process.env.NEXT_PUBLIC_MQTT_WS_HOST!
      const port    = process.env.NEXT_PUBLIC_MQTT_WS_PORT || '8884'
      const user    = process.env.NEXT_PUBLIC_MQTT_WS_USER!
      const pass    = process.env.NEXT_PUBLIC_MQTT_WS_PASS!

      const client = mqtt.connect(`wss://${host}:${port}/mqtt`, {
        username:         user,
        password:         pass,
        clientId:         `druida_web_${deviceId}_${Math.random().toString(16).slice(2)}`,
        reconnectPeriod:  5000,
        connectTimeout:   15000,
        clean:            true,
      })

      if (cancelled) { client.end(); return }
      clientRef.current = client

      client.on('connect', () => {
        if (cancelled) return
        setConnected(true)
        client.subscribe(`druida/${deviceId}/state`, { qos: 0 })
      })

      client.on('message', (_topic, payload) => {
        try {
          const s = JSON.parse(payload.toString())
          setState(prev => ({
            temp:   s.temp   ?? prev.temp,
            hum:    s.hum    ?? prev.hum,
            dpv:    s.dpv    ?? prev.dpv,
            relays: s.relays ?? prev.relays,
            params: s.params ? { ...prev.params, ...s.params } : prev.params,
          }))
        } catch {}
      })

      client.on('close',      () => { if (!cancelled) setConnected(false) })
      client.on('error',      () => { if (!cancelled) setConnected(false) })
      client.on('disconnect', () => { if (!cancelled) setConnected(false) })
    }

    connect()

    return () => {
      cancelled = true
      clientRef.current?.end()
      clientRef.current = null
      setConnected(false)
    }
  }, [deviceId])

  return { state, connected }
}
