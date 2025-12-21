import { redirect } from "next/navigation"
import { differenceInCalendarDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { ReviewQueue } from "@/components/student/review-queue"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

type ReviewItem = {
  id: string
  questionId: string
  questionText: string
  explanation?: string | null
  correctOptions: string[]
  quizId: string
  quizTitle?: string | null
  subjectName?: string | null
  createdAt: string
  daysSince: number
}

export default async function StudentReviewPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect("/auth/signin")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, series:series(name)")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/auth/onboarding")
  }

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("id")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(200)

  const attemptIds = (attempts || []).map((attempt) => attempt.id)

  let reviewItems: ReviewItem[] = []

  if (attemptIds.length > 0) {
    const { data: answers } = await supabase
      .from("user_answers")
      .select(`
        id,
        question_id,
        is_correct,
        created_at,
        question:questions(
          id,
          question_text,
          explanation,
          quiz_exercise_id,
          answer_options(id, option_text, is_correct, order_index),
          quiz_exercise:quiz_exercises(
            id,
            title,
            subject:subjects(name, color)
          )
        )
      `)
      .in("quiz_attempt_id", attemptIds)
      .eq("is_correct", false)
      .order("created_at", { ascending: false })
      .limit(60)

    const byQuestion = new Map<string, ReviewItem>()
    const now = new Date()

    ;(answers || []).forEach((answer: any) => {
      if (!answer?.question?.id) return
      if (byQuestion.has(answer.question.id)) return

      const options = (answer.question.answer_options || [])
        .filter((option: any) => option.is_correct)
        .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((option: any) => option.option_text)

      const createdAt = answer.created_at
      const daysSince = createdAt
        ? differenceInCalendarDays(now, new Date(createdAt))
        : 0

      byQuestion.set(answer.question.id, {
        id: answer.id,
        questionId: answer.question.id,
        questionText: answer.question.question_text,
        explanation: answer.question.explanation,
        correctOptions: options,
        quizId: answer.question.quiz_exercise?.id ?? answer.question.quiz_exercise_id,
        quizTitle: answer.question.quiz_exercise?.title ?? null,
        subjectName: answer.question.quiz_exercise?.subject?.name ?? null,
        createdAt: createdAt ?? new Date().toISOString(),
        daysSince,
      })
    })

    reviewItems = Array.from(byQuestion.values())
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium uppercase text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Revision intelligente
          </div>
          <h1 className="text-3xl font-bold">File de revision</h1>
          <p className="text-sm text-muted-foreground">
            Reviser en priorite vos questions ratees pour ancrer les notions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{profile.series?.name ?? "Serie"}</Badge>
          <Badge variant="secondary">{reviewItems.length} questions a revoir</Badge>
        </div>
      </div>

      {reviewItems.length > 0 ? (
        <ReviewQueue items={reviewItems} />
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Tout est a jour</CardTitle>
            <CardDescription>Continuez a pratiquer pour alimenter votre file.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Lancez un quiz ou une simulation pour identifier vos prochaines questions a revoir.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
