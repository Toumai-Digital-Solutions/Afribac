"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarClock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type PlanItem = {
  id: string
  time: string
  title: string
  description?: string
  type: "course" | "quiz" | "exam" | "review"
  duration: string
  href?: string
}

interface DailyStudyPlanProps {
  dateLabel: string
  items: PlanItem[]
}

const typeLabels: Record<PlanItem["type"], { label: string; variant: "secondary" | "outline" }> = {
  course: { label: "Cours", variant: "secondary" },
  quiz: { label: "Quiz", variant: "outline" },
  exam: { label: "Simulation", variant: "outline" },
  review: { label: "Révision", variant: "secondary" },
}

export function DailyStudyPlan({ dateLabel, items }: DailyStudyPlanProps) {
  const storageKey = "afribac.daily-plan"
  const [completed, setCompleted] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as Record<string, boolean>
      setCompleted(parsed)
    } catch {
      setCompleted({})
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(storageKey, JSON.stringify(completed))
  }, [completed])

  const completedCount = useMemo(() => {
    return items.filter((item) => completed[item.id]).length
  }, [items, completed])

  const completionPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 bg-primary/5">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Plan du jour</CardTitle>
              <p className="text-sm text-muted-foreground">{dateLabel}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              {completedCount}/{items.length} terminés
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {items.map((item) => {
          const config = typeLabels[item.type]
          const isChecked = Boolean(completed[item.id])
          return (
            <Card
              key={item.id}
              className={cn(
                "border-muted-foreground/10 bg-muted/10 transition",
                isChecked && "border-green-200 bg-green-50"
              )}
            >
              <CardContent className="grid gap-4 p-5 sm:grid-cols-[90px_1fr]">
                <div className="text-sm font-semibold text-muted-foreground">{item.time}</div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={config.variant}>{config.label}</Badge>
                        <span className="text-xs text-muted-foreground">{item.duration}</span>
                      </div>
                      <h3 className="text-base font-semibold">{item.title}</h3>
                      {item.description ? (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            setCompleted((prev) => ({ ...prev, [item.id]: Boolean(checked) }))
                          }
                        />
                        Terminé
                      </label>
                      {item.href ? (
                        <Button size="sm" variant="outline" asChild>
                          <a href={item.href}>Ouvrir</a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {isChecked ? (
                    <div className="inline-flex items-center gap-2 text-xs text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Bravo, continuez sur cette lancée.
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
