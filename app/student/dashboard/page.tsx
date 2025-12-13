import { redirect } from 'next/navigation'

export default function StudentDashboardRedirect() {
  // Legacy student dashboard route. Canonical entrypoint is /dashboard.
  redirect('/dashboard')
}
