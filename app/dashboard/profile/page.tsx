import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/forms/profile-form'
import { ProfileCompletionCard } from '@/components/profile/profile-completion-card'
import { MentorInviteCard } from '@/components/profile/mentor-invite-card'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // If no user, redirect to signin
  if (!user || error) {
    redirect('/auth/signin')
  }

  // Get user profile with details
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

  // Get all countries for the dropdown
  const { data: countries } = await supabase
    .from('countries')
    .select('*')
    .order('name')

  // Get all series for the dropdown
  const { data: series } = await supabase
    .from('series')
    .select(`
      *,
      country:countries(*)
    `)
    .order('name')

  return (
    <div className="space-y-6">
      <ProfileForm
        profile={profile}
        countries={countries || []}
        series={series || []}
      />

      {/* Profile completion checklist for students */}
      {profile.role === 'user' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ProfileCompletionCard profile={profile} />
          <MentorInviteCard />
        </div>
      )}
    </div>
  )
}