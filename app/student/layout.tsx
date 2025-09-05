import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
