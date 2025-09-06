import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuizExerciseEditor } from '@/components/forms/quiz-exercise-editor'

interface NewQuizExercisePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function NewQuizExercisePage({ searchParams }: NewQuizExercisePageProps) {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/signin')
  }

  // Check if user has permission to create quiz/exercises (member or admin)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !['member', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Get content type and course_id from search params
  const contentType = (searchParams.type as string) || 'quiz'
  const courseId = (searchParams.course_id as string) || ''
  const validTypes = ['quiz', 'exercise']
  const selectedType = validTypes.includes(contentType) ? contentType : 'quiz'

  const title = selectedType === 'quiz' ? 'Créer un nouveau quiz' : 'Créer un nouvel exercice'
  const description = selectedType === 'quiz' 
    ? 'Créez un quiz interactif avec questions à choix multiples.'
    : 'Créez un exercice avec questions et solutions détaillées.'

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
      
      <QuizExerciseEditor 
        mode="create" 
        contentType={selectedType as 'quiz' | 'exercise'}
        initialData={courseId ? { course_id: courseId } : undefined}
      />
    </div>
  )
}
