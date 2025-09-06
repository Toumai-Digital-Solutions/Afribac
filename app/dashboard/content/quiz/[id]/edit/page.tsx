import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuizExerciseEditor } from '@/components/forms/quiz-exercise-editor'

interface EditQuizExercisePageProps {
  params: {
    id: string
  }
}

export default async function EditQuizExercisePage({ params }: EditQuizExercisePageProps) {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/signin')
  }

  // Check if user has permission to edit quiz/exercises
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !['member', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch the quiz/exercise with all related data
  const { data: quizExercise, error: quizExerciseError } = await supabase
    .from('quiz_exercises')
    .select(`
      *,
      subject:subjects(id, name, color, icon),
      series:series!inner(
        id,
        name,
        countries(name)
      ),
      created_by_profile:profiles(full_name),
      questions!inner(
        id,
        question_text,
        question_type,
        points,
        explanation,
        order_index,
        answer_options(
          id,
          option_text,
          is_correct,
          order_index
        )
      ),
      quiz_exercise_tags(
        tag_id,
        tags(id, name, type, color)
      )
    `)
    .eq('id', params.id)
    .order('order_index', { foreignTable: 'questions' })
    .order('order_index', { foreignTable: 'questions.answer_options' })
    .single()

  if (quizExerciseError || !quizExercise) {
    notFound()
  }

  // Check if user can edit this quiz/exercise (admin can edit all, members can edit their own)
  if (profile.role !== 'admin' && quizExercise.created_by !== user.id) {
    redirect('/dashboard/content/quiz')
  }

  const title = quizExercise.content_type === 'quiz' ? 'Modifier le quiz' : 'Modifier l\'exercice'
  const description = quizExercise.content_type === 'quiz'
    ? 'Modifiez les questions et paramètres de ce quiz interactif.'
    : 'Modifiez les questions et solutions de cet exercice.'

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">
          {description} "{quizExercise.title}"
        </p>
      </div>
      
      <QuizExerciseEditor 
        mode="edit" 
        contentType={quizExercise.content_type}
        initialData={quizExercise} 
      />
    </div>
  )
}
