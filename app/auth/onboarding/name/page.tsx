import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthShell } from '@/components/auth/auth-shell'
import { NameForm } from '@/components/auth/profile/name-form'

export default async function OnboardingNamePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/signin')
  if (profile.full_name) redirect('/auth/onboarding')

  // For members/admins, only 2 steps (no goals step)
  const totalSteps = profile.role === 'user' ? 3 : 2

  return (
    <AuthShell
      title="Votre nom complet"
      subtitle="Dis-nous comment t'appeler."
      currentStep={1}
      totalSteps={totalSteps}
    >
      <NameForm />
    </AuthShell>
  )
}

