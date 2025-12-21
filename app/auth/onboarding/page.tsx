import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/signin')

  // Step 1: Name
  if (!profile.full_name) {
    redirect('/auth/onboarding/name')
  }

  // Step 2: Location (country & series)
  if (!profile.country_id || (profile.role === 'user' && !profile.series_id)) {
    redirect('/auth/onboarding/location')
  }

  // Step 3: Study goals (only for students)
  if (profile.role === 'user' && (!profile.study_goal || !profile.weekly_availability_hours)) {
    redirect('/auth/onboarding/goals')
  }

  redirect('/dashboard')
}
