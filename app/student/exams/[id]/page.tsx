import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExamDetailClient } from '@/components/student/exam-detail-client'

export default async function StudentExamDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const defaultTab = sp?.tab === 'correction' ? 'correction' : 'subject'

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) redirect('/auth/signin')

  const { data: exam, error } = await supabase
    .from('exam_details')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !exam) notFound()

  return (
    <ExamDetailClient
      defaultTab={defaultTab}
      exam={{
        id: exam.id,
        title: exam.title,
        description: exam.description,
        subjectName: exam.subject_name ?? null,
        seriesName: exam.series_name ?? null,
        countryName: exam.country_name ?? null,
        durationMinutes: exam.duration_minutes ?? null,
        totalPoints: exam.total_points ?? null,
        examYear: exam.exam_year ?? null,
        examSession: exam.exam_session ?? null,
        questionsPdfUrl: exam.questions_pdf_url ?? null,
        correctionPdfUrl: exam.correction_pdf_url ?? null,
        questionsContent: exam.questions_content ?? null,
        correctionContent: exam.correction_content ?? null,
      }}
    />
  )
}


