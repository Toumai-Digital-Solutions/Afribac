import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExamEditor } from '@/components/forms/exam-editor'

export default async function NewExamPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/signin')
  }

  // Check if user has permission to create exams (member or admin)
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
        <h1 className="text-3xl font-bold">Créer un nouvel examen</h1>
        <p className="text-muted-foreground">
          Créez un examen avec questions et corrections détaillées.
        </p>
      </div>
      
      <ExamEditor mode="create" />
    </div>
  )
}
