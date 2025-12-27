import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TagsManager } from '@/components/admin/tags-manager'

export default async function TagsPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user || error) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des tags</h1>
        <p className="text-muted-foreground">
          Créez et gérez les tags pour organiser vos cours
        </p>
      </div>

      <TagsManager initialTags={tags || []} />
    </div>
  )
}
