import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TrophiesPageContent } from './trophies-content'

export const metadata = {
  title: 'Mes trophées | Afribac',
  description: 'Vos badges, niveaux, points et classements',
}

export default async function TrophiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/signin')
  if (profile.role !== 'user') redirect('/dashboard')

  return <TrophiesPageContent userId={user.id} profile={profile} />
}
