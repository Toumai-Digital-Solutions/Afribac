import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default async function MainDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
