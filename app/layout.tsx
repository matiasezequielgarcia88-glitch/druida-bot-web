import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Druida BOT',
  description: 'Control remoto de tu DruidaBot',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
