import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExamSimulationClient } from '@/components/student/exam-simulation-client'

export default async function StudentSimulationExamPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, country_id, series_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/onboarding')
  if (!profile.country_id || !profile.series_id) redirect('/auth/onboarding/location')

  const { data: exam, error } = await supabase
    .from('exams')
    .select(`
      id,
      title,
      duration_minutes,
      total_points,
      status,
      questions_pdf_url,
      correction_pdf_url,
      questions_content,
      correction_content,
      subject:subjects(name, color),
      series:series(id, name)
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !exam) notFound()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Simulation d&apos;examen</CardTitle>
          <div className="flex gap-2">
            <Link href={`/student/exams/${exam.id}`}>
              <Button variant="outline">Voir l&apos;examen</Button>
            </Link>
            <Link href="/student/simulation">
              <Button variant="outline">Retour</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Votre copie est sauvegardée automatiquement pendant la simulation.
        </CardContent>
      </Card>

      <ExamSimulationClient
        exam={{
          id: exam.id,
          title: exam.title,
          durationMinutes: exam.duration_minutes ?? 180,
          totalPoints: exam.total_points ?? null,
          subjectName: (exam as any).subject?.name ?? null,
          questionsPdfUrl: (exam as any).questions_pdf_url ?? null,
          correctionPdfUrl: (exam as any).correction_pdf_url ?? null,
          questionsContent: (exam as any).questions_content ?? null,
          correctionContent: (exam as any).correction_content ?? null,
        }}
      />
    </div>
  )
}


