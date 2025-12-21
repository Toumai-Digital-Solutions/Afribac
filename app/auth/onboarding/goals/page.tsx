import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthShell } from '@/components/auth/auth-shell'
import { GoalsForm } from '@/components/auth/goals-form'

export default async function OnboardingGoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/signin')

  // Check previous steps are complete
  if (!profile.full_name) redirect('/auth/onboarding/name')
  if (!profile.country_id || (profile.role === 'user' && !profile.series_id)) {
    redirect('/auth/onboarding/location')
  }

  // If goals already set, go to dashboard
  if (profile.study_goal && profile.weekly_availability_hours) {
    redirect('/dashboard')
  }

  return (
    <AuthShell
      title="Vos objectifs"
      subtitle="Aidez-nous à personnaliser votre parcours d'apprentissage."
      currentStep={3}
      totalSteps={3}
      backHref="/auth/onboarding/location"
    >
      <GoalsForm
        userId={user.id}
        initialStudyGoal={profile.study_goal}
        initialWeeklyHours={profile.weekly_availability_hours}
      />
    </AuthShell>
  )
}
