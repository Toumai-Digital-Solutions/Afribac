import { redirect } from 'next/navigation'

export default function AdminDashboardRedirect() {
  // Legacy admin dashboard route. Canonical entrypoint is /dashboard.
  redirect('/dashboard')
}
