import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExamSimulation } from '@/components/educational/exam-simulation'
import {
  AlarmClock,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Shuffle,
  Sparkles,
  Target
} from 'lucide-react'

export default async function StudentSimulationPage() {
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

  const { data: recommendations } = await supabase
    .from('exam_details')
    .select('*')
    .eq('status', 'published')
    .eq('series_id', profile.series_id)
    .order('exam_year', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-3xl border bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium uppercase text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Mode simulation
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold lg:text-4xl">Testez-vous comme le jour du bac</h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Lancez une épreuve chronométrée, gérez votre stress et obtenez un compte rendu clair. Les simulations vous aident à transformer vos révisions en réflexes.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-white/70 px-4 py-3">
              <AlarmClock className="mb-2 h-4 w-4 text-primary" />
              Chronomètre intelligent avec alertes douces
            </div>
            <div className="rounded-2xl border border-primary/20 bg-white/70 px-4 py-3">
              <ClipboardList className="mb-2 h-4 w-4 text-primary" />
              Rapport détaillé : points forts, points à revoir
            </div>
            <div className="rounded-2xl border border-primary/20 bg-white/70 px-4 py-3">
              <Shuffle className="mb-2 h-4 w-4 text-primary" />
              Mélangez les questions pour varier vos défis
            </div>
            <div className="rounded-2xl border border-primary/20 bg-white/70 px-4 py-3">
              <Gauge className="mb-2 h-4 w-4 text-primary" />
              Historique de performances pour suivre vos progrès
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex h-full w-full max-w-sm flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-primary/25 bg-white/70 p-6 text-center text-sm text-muted-foreground shadow-sm">
            <div className="aspect-square w-48 rounded-full bg-gradient-to-br from-primary/40 via-primary/10 to-primary/30" />
            <p>
              Placeholder illustration · Lottie
              <br />
              (future animation d&apos;un compte à rebours stylisé)
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)]">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Comment ça marche ?</CardTitle>
            <CardDescription>Quatre étapes, et vous êtes prêt·e.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 h-7 w-7 justify-center rounded-full bg-primary/10 text-primary">
                1
              </Badge>
              Choisissez la matière et la session qui vous intéresse.
            </p>
            <p className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 h-7 w-7 justify-center rounded-full bg-primary/10 text-primary">
                2
              </Badge>
              Lancez le chronomètre, répondez dans l&apos;ordre qui vous convient.
            </p>
            <p className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 h-7 w-7 justify-center rounded-full bg-primary/10 text-primary">
                3
              </Badge>
              Soumettez vos réponses et découvrez votre score instantanément.
            </p>
            <p className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 h-7 w-7 justify-center rounded-full bg-primary/10 text-primary">
                4
              </Badge>
              Analysez le bilan, ajoutez vos notes et planifiez une nouvelle session.
            </p>
            <div className="pt-2">
              <Link href="/student/exams" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Choisir un examen recommandé
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="order-1 border-primary/10 bg-muted/20 backdrop-blur lg:order-2">
          <CardHeader>
            <CardTitle>Simulation express</CardTitle>
            <CardDescription>
              Lancez-vous immédiatement (démo sans impact sur vos statistiques).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExamSimulation title="Simulation Baccalauréat - Démonstration" duration={180} questions={[]} />
            <p className="mt-4 text-xs text-muted-foreground">
              Cette simulation de démonstration utilise des questions fictives. Les sujets officiels publiés sur Afribac seront automatiquement proposés ici.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Card className="border-muted-foreground/10">
          <CardHeader>
            <CardTitle>Examens recommandés</CardTitle>
            <CardDescription>Les sujets récents pour la série {profile.series?.[0].name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map(exam => (
                <div key={exam.id} className="rounded-2xl border border-muted/40 bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {exam.exam_year ? `Session ${exam.exam_year}` : 'Session récente'}
                      </p>
                      <p className="text-sm font-medium leading-snug">{exam.title}</p>
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {exam.subject_name ?? 'Sujet'}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {exam.duration_minutes ? <span>{exam.duration_minutes} min</span> : null}
                    {exam.total_points ? <span>{exam.total_points} pts</span> : null}
                  </div>
                  <Link
                    href={`/student/simulation/${exam.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary"
                  >
                    Lancer la simulation
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-muted/40 p-6 text-center text-sm text-muted-foreground">
                Aucun sujet publié pour votre série pour l&apos;instant. Revenez bientôt ou explorez d&apos;autres séries dans la bibliothèque.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Astuces performance
            </CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Pour transformer chaque simulation en progression durable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Réalisez une simulation complète le week-end, puis un format court en semaine.
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Conservez vos difficultés récurrentes dans un carnet d&apos;erreurs pour y revenir.
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Comparez vos résultats avec votre progression globale depuis l&apos;Accueil étudiant.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
