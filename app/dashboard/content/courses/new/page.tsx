import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CourseEditor } from '@/components/forms/course-editor'

export default async function NewCoursePage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/signin')
  }

  // Check if user has permission to create courses (member or admin)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !['member', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Créer un nouveau cours</h1>
        <p className="text-muted-foreground">
          Créez un cours complet avec du contenu riche, des associations et une sauvegarde automatique.
        </p>
      </div>
      
      <CourseEditor mode="create" />
    </div>
  )
}
