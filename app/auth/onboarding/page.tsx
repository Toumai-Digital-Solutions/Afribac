import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthShell } from '@/components/auth/auth-shell'

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

  if (!profile.full_name) {
    redirect('/auth/onboarding/name')
  }

  if (!profile.country_id || (profile.role === 'user' && !profile.series_id)) {
    redirect('/auth/onboarding/location')
  }

  redirect('/dashboard')
}
