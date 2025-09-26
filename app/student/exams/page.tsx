import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CalendarClock,
  ClipboardList,
  FileText,
  Layers,
  LucideTarget,
  Timer
} from 'lucide-react'

const MAX_EXAMS = 9

function formatSeriesLabel(seriesName?: string | null, countryName?: string | null) {
  if (seriesName && countryName) return `${seriesName} • ${countryName}`
  if (seriesName) return seriesName
  if (countryName) return countryName
  return 'Programme général'
}

export default async function StudentExamsPage({
  searchParams
}: {
  searchParams?: { q?: string }
}) {
  const search = searchParams?.q?.trim() ?? ''
  const supabase = await createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      country:countries(*),
      series:series(*)
    `)
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/onboarding')
  }

  if (!profile.country_id || !profile.series_id) {
    redirect('/auth/onboarding/location')
  }

  let examsQuery = supabase
    .from('exam_details')
    .select('*')
    .eq('status', 'published')
    .eq('series_id', profile.series_id)
    .order('exam_year', { ascending: false })
    .limit(36)

  if (search) {
    examsQuery = examsQuery.ilike('title', `%${search}%`)
  }

  const { data: exams } = await examsQuery
  const highlightedExams = (exams ?? []).slice(0, MAX_EXAMS)

  const hasResults = highlightedExams.length > 0

  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-3xl border bg-gradient-to-br from-primary/15 via-primary/5 to-primary/10 p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium uppercase text-primary">
            <FileText className="h-3.5 w-3.5" />
            Annales officielles
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold lg:text-4xl">
              Examens pour {formatSeriesLabel(profile.series?.name, profile.country?.name)}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Révisez avec des sujets authentiques. Les épreuves sont filtrées automatiquement selon votre série pour vous permettre de travailler efficacement, sans distraction.
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row" action="/student/exams" method="get">
            <Input
              name="q"
              placeholder="Rechercher un examen (ex : Session 2022, Français)"
              defaultValue={search}
              className="h-12 rounded-2xl text-base"
            />
            <Button type="submit" variant="secondary" className="h-12 rounded-2xl px-6 text-sm font-medium">
              Filtrer
            </Button>
          </form>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1">
              <Timer className="h-3.5 w-3.5" />
              Travaillez votre gestion du temps
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1">
              <ClipboardList className="h-3.5 w-3.5" />
              Analysez vos réponses après chaque session
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex h-full w-full max-w-sm flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-primary/25 bg-white/70 p-6 text-center text-sm text-muted-foreground shadow-sm">
            <div className="aspect-square w-44 rounded-full bg-gradient-to-br from-primary/40 via-primary/10 to-primary/30" />
            <p>
              Placeholder illustration · Lottie
              <br />
              (future animation d&apos;un étudiant en situation d&apos;examen)
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Sélection du moment</h2>
            <p className="text-sm text-muted-foreground">
              {hasResults ? `${highlightedExams.length} sujets accessibles immédiatement` : 'Les sujets arriveront bientôt.'}
            </p>
          </div>
          <Link href="/student/simulation" className="inline-flex">
            <Button variant="outline" className="rounded-2xl px-4 text-sm">
              Passer en mode simulation
            </Button>
          </Link>
        </div>

        {hasResults ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {highlightedExams.map(exam => (
              <Card key={exam.id} className="border-muted-foreground/10 bg-muted/20 backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {exam.subject_name ? (
                      <Badge variant="secondary" className="rounded-full bg-white text-foreground">
                        {exam.subject_name}
                      </Badge>
                    ) : null}
                    {exam.exam_year ? (
                      <Badge variant="outline" className="rounded-full">
                        Session {exam.exam_year}
                      </Badge>
                    ) : null}
                    {exam.exam_session ? (
                      <Badge variant="outline" className="rounded-full">
                        {exam.exam_session}
                      </Badge>
                    ) : null}
                  </div>
                  <CardTitle className="text-base leading-snug">
                    {exam.title}
                  </CardTitle>
                  {exam.description ? (
                    <CardDescription className="leading-relaxed text-muted-foreground line-clamp-3">
                      {exam.description}
                    </CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Timer className="h-3.5 w-3.5" />
                      Durée : {exam.duration_minutes ?? 180} min
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <LucideTarget className="h-3.5 w-3.5" />
                      Total : {exam.total_points ?? 'Non précisé'} points
                    </span>
                    {exam.country_name ? (
                      <span className="inline-flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5" />
                        {exam.country_name}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    <Button className="w-full rounded-2xl text-sm">
                      Consulter le sujet
                    </Button>
                    <Button variant="outline" className="w-full rounded-2xl text-sm">
                      Voir la correction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-6 border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-sm text-muted-foreground">
              
              Aucun examen n&apos;est encore disponible pour votre série. Revenez bientôt ou explorez la bibliothèque globale pour garder une longueur d&apos;avance.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="rounded-3xl border bg-muted/25 p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.7fr)]">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Routine recommandée</h2>
            <p className="text-sm text-muted-foreground">
              Alternez entre révision guidée et simulation en conditions réelles pour consolider vos connaissances.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />
                Planifiez 2 examens/semaine pour créer un rythme durable.
              </li>
              <li className="flex items-start gap-2">
                <LucideTarget className="mt-0.5 h-4 w-4 text-primary" />
                Analysez votre score à chaud, puis notez 3 axes d&apos;amélioration.
              </li>
              <li className="flex items-start gap-2">
                <ClipboardList className="mt-0.5 h-4 w-4 text-primary" />
                Ajoutez vos corrections favorites à votre bibliothèque personnelle.
              </li>
            </ul>
            <div className="pt-4">
              <Link href="/student/simulation">
                <Button className="rounded-2xl">Commencer une simulation</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex h-full w-full max-w-xs items-center justify-center rounded-3xl border border-dashed border-muted-foreground/30 bg-background/70 p-6 text-center text-xs text-muted-foreground">
              Future illustration : minuteur et copie d&apos;examen stylisés
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
