import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Legacy surface: canonical entrypoint is /dashboard (role-aware).
  redirect('/dashboard')
  return <DashboardLayout>{children}</DashboardLayout>
}
