import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { QuizPlayer } from '@/components/educational/quiz-player'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function StudentQuizTakePage({
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

  const { data: quiz, error } = await supabase
    .from('quiz_exercises')
    .select(`
      *,
      subject:subjects(*),
      series:series(*, country:countries(*)),
      course:courses(*),
      questions(
        *,
        answer_options(*)
      )
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !quiz) notFound()

  const normalizedQuiz = {
    ...quiz,
    questions: (quiz as any).questions?.slice().sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)).map((q: any) => ({
      ...q,
      answer_options: (q.answer_options ?? []).slice().sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
    })) ?? [],
    tags: [],
    created_by_profile: null,
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Lancer {quiz.content_type === 'quiz' ? 'un quiz' : 'un exercice'}</CardTitle>
          <Link href="/student/quiz">
            <Button variant="outline">Retour</Button>
          </Link>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Votre tentative sera sauvegardée à la soumission.
        </CardContent>
      </Card>

      <QuizPlayer quiz={normalizedQuiz as any} />
    </div>
  )
}


