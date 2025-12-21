import { redirect } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { createClient } from "@/lib/supabase/server"
import { DailyStudyPlan } from "@/components/student/daily-study-plan"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Sparkles } from "lucide-react"

export default async function StudentPlannerPage() {
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
    .select("id, full_name, country:countries(name), series:series(name)")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/auth/onboarding")
  }

  const dateLabel = format(new Date(), "eeee d MMMM", { locale: fr })
  const planItems = [
    {
      id: "course-block",
      time: "08:00",
      title: "Cours prioritaire - Algèbre linéaire",
      description: "Revoir les matrices et les applications linéaires.",
      type: "course",
      duration: "45 min",
      href: "/student/courses",
    },
    {
      id: "quiz-block",
      time: "10:30",
      title: "Quiz rapide - Probabilités",
      description: "5 questions pour consolider les bases.",
      type: "quiz",
      duration: "20 min",
      href: "/student/quiz",
    },
    {
      id: "review-block",
      time: "14:00",
      title: "Révision guidée - Chapitre précédent",
      description: "Focus sur les erreurs fréquentes.",
      type: "review",
      duration: "30 min",
    },
    {
      id: "exam-block",
      time: "17:30",
      title: "Simulation d'examen - Session 2023",
      description: "Chronométrée, conditions réelles.",
      type: "exam",
      duration: "90 min",
      href: "/student/simulation",
    },
  ] as const

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium uppercase text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Planificateur quotidien
          </div>
          <h1 className="text-3xl font-bold">Plan de révision</h1>
          <p className="text-sm text-muted-foreground">
            Optimisez vos révisions pour {profile.series?.name ?? "votre série"} ({profile.country?.name ?? "votre pays"}).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{profile.series?.name ?? "Série"}</Badge>
          <Badge variant="outline">{profile.country?.name ?? "Pays"}</Badge>
          <Badge variant="secondary" className="gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {dateLabel}
          </Badge>
        </div>
      </div>

      <DailyStudyPlan dateLabel={dateLabel} items={planItems as any} />

      <Card className="border-muted-foreground/10 bg-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Conseils du jour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Alternez lecture et pratique pour garder un rythme régulier.</p>
          <p>Bloquez un créneau de révision rapide avant de dormir pour mémoriser.</p>
        </CardContent>
      </Card>
    </div>
  )
}
