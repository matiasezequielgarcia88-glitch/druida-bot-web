'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMqtt } from '@/hooks/useMqtt'
import { createContext, useContext } from 'react'
import type { DeviceState } from '@/hooks/useMqtt'

interface DeviceCtx {
  state:     DeviceState
  connected: boolean
  deviceId:  string
}

const DeviceContext = createContext<DeviceCtx | null>(null)

export function useDevice() {
  const ctx = useContext(DeviceContext)
  if (!ctx) throw new Error('useDevice must be used inside DashboardShell')
  return ctx
}

export default function DashboardShell({
  deviceId,
  deviceName,
  children,
}: {
  deviceId:   string
  deviceName: string
  children:   React.ReactNode
}) {
  const pathname          = usePathname()
  const { state, connected } = useMqtt(deviceId)

  const tabs = [
    { href: '/',         label: 'Dashboard' },
    { href: '/devices',  label: 'Dispositivos' },
    { href: '/params',   label: 'Parámetros' },
  ]

  return (
    <DeviceContext.Provider value={{ state, connected, deviceId }}>
      <div className="app">
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-logo" type="button">
              DRUIDA <span>BOT</span>
            </button>
            <div className="topbar-sub">{deviceName}</div>
          </div>
          <div className="topbar-right">
            <div className={`online-badge${connected ? '' : ' offline'}`}>
              <span className="online-dot" />
              <span>{connected ? 'En línea' : 'Sin conexión'}</span>
            </div>
          </div>
        </header>

        <nav className="tabs">
          {tabs.map(t => (
            <Link
              key={t.href}
              href={t.href}
              className={`tab${pathname === t.href ? ' active' : ''}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <main style={{ flex: 1 }}>
          {children}
        </main>

        <footer>
          <p>druidadata@gmail.com · DataDruida</p>
        </footer>
      </div>
    </DeviceContext.Provider>
  )
}
