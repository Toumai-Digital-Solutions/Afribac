"use client"

import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

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

interface ReviewQueueProps {
  items: ReviewItem[]
}

function getDueLabel(daysSince: number) {
  if (daysSince >= 5) return { label: "En retard", className: "bg-red-100 text-red-700" }
  if (daysSince >= 2) return { label: "A revoir", className: "bg-yellow-100 text-yellow-700" }
  return { label: "Fraiche", className: "bg-green-100 text-green-700" }
}

export function ReviewQueue({ items }: ReviewQueueProps) {
  const storageKey = "afribac.reviewed-questions"
  const [reviewedIds, setReviewedIds] = useState<string[]>([])
  const [hideReviewed, setHideReviewed] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as string[]
      setReviewedIds(parsed)
    } catch {
      setReviewedIds([])
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(storageKey, JSON.stringify(reviewedIds))
  }, [reviewedIds])

  const visibleItems = useMemo(() => {
    if (!hideReviewed) return items
    return items.filter((item) => !reviewedIds.includes(item.questionId))
  }, [items, hideReviewed, reviewedIds])

  const completionPct = items.length > 0
    ? Math.round((reviewedIds.length / items.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 bg-primary/5">
        <CardHeader>
          <CardTitle>File de revision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>{items.length} questions a revoir</span>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox checked={hideReviewed} onCheckedChange={(checked) => setHideReviewed(Boolean(checked))} />
              Masquer les questions revisees
            </label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {visibleItems.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleItems.map((item) => {
            const due = getDueLabel(item.daysSince)
            const reviewed = reviewedIds.includes(item.questionId)
            return (
              <Card
                key={item.id}
                className={cn("border-muted-foreground/10 bg-muted/10", reviewed && "opacity-70")}
              >
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {item.subjectName ? <Badge variant="secondary">{item.subjectName}</Badge> : null}
                    {item.quizTitle ? <Badge variant="outline">{item.quizTitle}</Badge> : null}
                    <Badge className={due.className}>{due.label}</Badge>
                    <span>
                      Ratee {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <CardTitle className="text-lg">Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: item.questionText }}
                  />
                  <div className="space-y-2 text-sm">
                    <p className="text-xs text-muted-foreground">Bonne reponse</p>
                    <div className="flex flex-wrap gap-2">
                      {item.correctOptions.length > 0 ? (
                        item.correctOptions.map((option) => (
                          <Badge key={option} variant="secondary">{option}</Badge>
                        ))
                      ) : (
                        <Badge variant="outline">A verifier</Badge>
                      )}
                    </div>
                  </div>
                  {item.explanation ? (
                    <div
                      className="rounded-xl border bg-white/70 p-3 text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: item.explanation }}
                    />
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/student/quiz/${item.quizId}`}>Revoir le quiz</a>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        setReviewedIds((prev) =>
                          prev.includes(item.questionId)
                            ? prev.filter((id) => id !== item.questionId)
                            : [...prev, item.questionId]
                        )
                      }
                    >
                      {reviewed ? "Marquer non revise" : "Marquer revise"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Aucun element dans votre file de revision pour le moment.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
