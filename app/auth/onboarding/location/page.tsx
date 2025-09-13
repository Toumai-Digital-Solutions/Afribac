import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthShell } from '@/components/auth/auth-shell'
import { OnboardingForm } from '@/components/auth/onboarding-form'

export default async function OnboardingLocationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/signin')
  if (!profile.full_name) redirect('/auth/onboarding/name')
  if (profile.country_id && (profile.role !== 'user' || profile.series_id)) redirect('/dashboard')

  return (
    <AuthShell title="Votre pays et série" subtitle="Pour personnaliser vos contenus.">
      <OnboardingForm role={profile.role} />
    </AuthShell>
  )
}

