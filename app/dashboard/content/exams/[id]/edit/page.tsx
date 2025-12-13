import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExamEditor } from '@/components/forms/exam-editor'

interface EditExamPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditExamPage(props: EditExamPageProps) {
  const params = await props.params
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/signin')
  }

  // Check if user has permission to edit exams
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !['member', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch the exam with all related data
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .select(`
      *,
      subject:subjects(id, name, color, icon),
      series:series(
        id,
        name,
        countries(name)
      ),
      created_by_profile:profiles(full_name),
      exam_tags(
        tag_id,
        tags(id, name, type, color)
      )
    `)
    .eq('id', params.id)
    .single()

  if (examError || !exam) {
    notFound()
  }

  // Check if user can edit this exam (admin can edit all, members can edit their own)
  if (profile.role !== 'admin' && exam.created_by !== user.id) {
    redirect('/dashboard/content/exams')
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier l'examen</h1>
        <p className="text-muted-foreground">
          Modifiez "{exam.title}".
        </p>
      </div>

      <ExamEditor mode="edit" initialData={exam} />
    </div>
  )
}
