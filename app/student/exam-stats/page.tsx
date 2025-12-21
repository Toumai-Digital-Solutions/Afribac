import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SubjectExamStatsCard } from '@/components/student/subject-exam-stats-card'
import { Award, BarChart3, BookOpen, Clock, Target } from 'lucide-react'

function formatMinutes(minutes: number | null): string {
  if (!minutes) return '0 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = minutes / 60
  return `${hours.toFixed(1)} h`
}

export default async function StudentExamStatsPage() {
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
    .select('id, series_id, series:series(name)')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/onboarding')
  }

  const seriesName = (profile.series as any)?.name ?? "—"

  // Fetch subject-level exam statistics
  const { data: subjectStats } = await supabase
    .from('user_subject_exam_stats')
    .select('*')
    .eq('user_id', profile.id)
    .order('total_submissions', { ascending: false })

  // Fetch overall statistics
  const { data: overallStats } = await supabase
    .from('user_overall_exam_stats')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  const hasExamData = subjectStats && subjectStats.length > 0

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Statistiques d'examens</h1>
        <p className="text-sm text-muted-foreground">
          Suivez vos performances et identifiez vos points forts par matière.
        </p>
      </div>

      {/* Overall Statistics */}
      {overallStats && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total examens</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats.total_exam_submissions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {overallStats.total_completed_exams || 0} terminés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats.overall_average_score 
                  ? `${overallStats.overall_average_score.toFixed(1)}/20`
                  : '—'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {overallStats.overall_average_score
                  ? `${((overallStats.overall_average_score / 20) * 100).toFixed(0)}%`
                  : 'Aucune note'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matières évaluées</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats.subjects_attempted || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Série {seriesName}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatMinutes(overallStats.total_time_spent_minutes)}
              </div>
              <p className="text-xs text-muted-foreground">
                Sur tous les examens
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subject-Level Statistics */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Performance par matière</h2>
        </div>

        {hasExamData ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjectStats.map((stat: any) => (
              <SubjectExamStatsCard
                key={stat.subject_id}
                subjectName={stat.subject_name}
                subjectColor={stat.subject_color}
                subjectIcon={stat.subject_icon}
                totalSubmissions={stat.total_submissions}
                completedSubmissions={stat.completed_submissions}
                averageScore={stat.average_score}
                bestScore={stat.best_score}
                lowestScore={stat.lowest_score}
                totalTimeSpentMinutes={stat.total_time_spent_minutes}
                lastSubmissionDate={stat.last_submission_date}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2 text-lg">Aucun examen soumis</CardTitle>
              <CardDescription className="mx-auto max-w-md">
                Commencez à passer des examens pour voir vos statistiques ici. 
                Rendez-vous dans la section Simulation pour démarrer.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
