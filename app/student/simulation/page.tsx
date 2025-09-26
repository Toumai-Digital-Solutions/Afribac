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
  FileText,
  Flame,
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
    <div className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Mode simulation
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">Entraînez-vous comme le jour du bac</h1>
              <p className="text-sm text-muted-foreground">
                Lancez une épreuve chronométrée, répondez aux questions officielles et obtenez un retour détaillé pour booster vos chances de réussite.
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-white/70 px-4 py-3">
              <AlarmClock className="h-4 w-4 text-primary" />
              Chronomètre intelligent
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-white/70 px-4 py-3">
              <ClipboardList className="h-4 w-4 text-primary" />
              Bilan par compétence
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-white/70 px-4 py-3">
              <Flame className="h-4 w-4 text-primary" />
              Historique de performances
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Simulation express</CardTitle>
            <CardDescription>
              Testez-vous immédiatement avec une épreuve type bac (questions fictives de démonstration).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExamSimulation title="Simulation Baccalauréat - Démo" duration={180} />
            <p className="mt-4 text-xs text-muted-foreground">
              Cette simulation de démonstration utilise des questions fictives. Les sujets officiels apparaîtront automatiquement dès leur publication.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Comment fonctionne la simulation ?</CardTitle>
              <CardDescription>Quatre étapes et c'est parti !</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5 h-6 w-6 justify-center rounded-full bg-primary/10 text-primary">
                  1
                </Badge>
                Choisissez votre matière et votre session préférée
              </p>
              <p className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5 h-6 w-6 justify-center rounded-full bg-primary/10 text-primary">
                  2
                </Badge>
                Lancez le chronomètre et répondez aux questions dans l'ordre que vous voulez
              </p>
              <p className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5 h-6 w-6 justify-center rounded-full bg-primary/10 text-primary">
                  3
                </Badge>
                Soumettez votre copie et obtenez un score instantané
              </p>
              <p className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5 h-6 w-6 justify-center rounded-full bg-primary/10 text-primary">
                  4
                </Badge>
                Analysez les corrections, vos forces et vos axes d'amélioration
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Examens recommandés</CardTitle>
              <CardDescription>
                Les sujets les plus récents pour la série {profile.series?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map(exam => (
                  <div key={exam.id} className="rounded-xl border bg-muted/30 p-3">
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
                      {exam.duration_minutes ? (
                        <span>{exam.duration_minutes} min</span>
                      ) : null}
                      {exam.total_points ? (
                        <span>{exam.total_points} pts</span>
                      ) : null}
                    </div>
                    <Link href={`/student/exams?q=${encodeURIComponent(exam.subject_name ?? '')}`} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      Utiliser ce sujet
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun sujet n'a encore été publié pour votre série. Consultez la bibliothèque globale pour explorer d'autres profils.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Astuce progression
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Doublez vos simulations : une en conditions réelles, une en mode révision ciblée.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Planifiez vos simulations le week-end pour générer un rapport complet avant la semaine.
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Analysez les compétences faibles puis relancez une séance ciblée (ex: uniquement les questions rédactionnelles).
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Comparez vos résultats avec vos amis via le tableau de bord Progrès.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
