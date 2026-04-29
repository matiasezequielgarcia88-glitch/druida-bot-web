import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: device } = await supabase
    .from('devices')
    .select('device_id, name')
    .eq('user_id', user.id)
    .single()

  // Sin dispositivo vinculado → página de setup
  if (!device) redirect('/setup')

  return (
    <DashboardShell deviceId={device.device_id} deviceName={device.name}>
      {children}
    </DashboardShell>
  )
}
