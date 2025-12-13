import { redirect } from 'next/navigation'

export default function MemberDashboardRedirect() {
  // Legacy member dashboard route. Canonical entrypoint is /dashboard.
  redirect('/dashboard')
}
