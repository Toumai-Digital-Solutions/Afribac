import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/dashboards/admin-dashboard'
import { MemberDashboard } from '@/components/dashboards/member-dashboard'
import { StudentDashboard } from '@/components/dashboards/student-dashboard'

export default async function DashboardRedirect() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // If no user, redirect to signin
  if (!user || error) {
    redirect('/auth/signin')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      country:countries(*),
      series:series(*)
    `)
    .eq('id', user.id)
    .single()

  // If no profile found, redirect to signin
  if (!profile) {
    redirect('/auth/signin')
  }

  // If profile incomplete, route to the appropriate onboarding step
  if (!profile.full_name) {
    redirect('/auth/onboarding/name')
  }
  if (!profile.country_id || (profile.role === 'user' && !profile.series_id)) {
    redirect('/auth/onboarding/location')
  }

  // Render role-specific dashboard
  if (profile.role === 'admin') {
    return <AdminDashboard profile={profile} />
  }
  
  if (profile.role === 'member') {
    return <MemberDashboard profile={profile} />
  }
  
  if (profile.role === 'user') {
    return <StudentDashboard profile={profile} />
  }

  // Fallback for unknown roles
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Bienvenue, {profile.full_name || 'Utilisateur'} 👋
          </h1>
          <p className="text-muted-foreground">
            Tableau de bord
          </p>
        </div>
      </div>
    </div>
  )
}
