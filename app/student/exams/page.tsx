import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { CalendarClock, FileText, Layers, Target, Timer } from 'lucide-react'

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
    .limit(24)

  if (search) {
    examsQuery = examsQuery.ilike('title', `%${search}%`)
  }

  const { data: exams } = await examsQuery

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border bg-muted/40 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase text-primary">
              <FileText className="h-3.5 w-3.5" />
              Annales officielles
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">Examens pour {formatSeriesLabel(profile.series?.name, profile.country?.name)}</h1>
              <p className="text-sm text-muted-foreground">
                Préparez-vous efficacement grâce aux sujets publiés pour votre série. Chaque examen contient les informations essentielles : durée, points et corrigés disponibles.
              </p>
            </div>
          </div>
          <div className="w-full max-w-md">
            <form className="flex gap-2" action="/student/exams" method="get">
              <Input
                name="q"
                placeholder="Rechercher un examen (ex: Session 2022)"
                defaultValue={search}
              />
              <Button type="submit" variant="secondary">
                Chercher
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Conseil : utilisez l'année, la session ou la matière pour filtrer rapidement.
            </p>
          </div>
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Derniers examens publiés</CardTitle>
                <CardDescription>
                  {exams && exams.length > 0
                    ? `${exams.length} sujets disponibles pour votre série`
                    : 'Aucun examen n’est encore disponible pour votre série.'}
                </CardDescription>
              </div>
              <Link href="/student/simulation">
                <Button variant="outline" size="sm">
                  Passer en mode simulation
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {exams && exams.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {exams.map(exam => (
                  <div key={exam.id} className="rounded-xl border bg-muted/30 p-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {exam.subject_name ? (
                          <Badge variant="secondary" className="bg-white text-foreground">
                            {exam.subject_name}
                          </Badge>
                        ) : null}
                        {exam.exam_year ? (
                          <Badge variant="outline">Session {exam.exam_year}</Badge>
                        ) : null}
                        {exam.exam_session ? (
                          <Badge variant="outline">{exam.exam_session}</Badge>
                        ) : null}
                      </div>
                      <h3 className="text-base font-semibold leading-tight">
                        {exam.title}
                      </h3>
                      {exam.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {exam.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Timer className="h-3.5 w-3.5" />
                        Durée : {exam.duration_minutes ?? 180} min
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5" />
                        Total : {exam.total_points ?? 'Non précisé'} points
                      </div>
                      {exam.country_name ? (
                        <div className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5" />
                          {exam.country_name}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm">Consulter le sujet</Button>
                      <Button size="sm" variant="outline">
                        Voir la correction
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                Aucun examen n'a encore été publié pour votre série. Revenez bientôt ou explorez la bibliothèque globale pour d'autres séries.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Prêt(e) pour une épreuve complète ?</CardTitle>
            <CardDescription>
              Simulez un examen dans des conditions réelles et recevez un débrief détaillé.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>✅ Choix du sujet par matière</p>
              <p>✅ Chronomètre intégré</p>
              <p>✅ Rapport personnalisé à la fin</p>
            </div>
            <Link href="/student/simulation">
              <Button>
                Lancer une simulation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
