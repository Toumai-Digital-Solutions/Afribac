import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GalleryManager } from '@/components/gallery/gallery-manager'

export default async function DashboardGalleryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/signin')
  }

  if (!['admin', 'member'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const { data: assets } = await supabase
    .from('gallery_assets')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <GalleryManager
      assets={assets || []}
      userRole={profile.role as 'admin' | 'member'}
      userId={user.id}
    />
  )
}

