import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubjectExamStatsCard } from "@/components/student/subject-exam-stats-card"
import { TrendingUp, Target, BookOpen, FileText, Award, Clock } from "lucide-react"

type SubjectStats = {
  id: string
  name: string
  color: string | null
  totalCourses: number
  completedCourses: number
  averageProgress: number
  timeSpent: number
}

function formatMinutes(value: number) {
  if (value < 60) return `${Math.round(value)} min`
  const hours = value / 60
  return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)} h`
}

export default async function StudentMasteryPage() {
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
    .select("id, series_id, series:series(name)")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/auth/onboarding")
  }

  const seriesName = (profile.series as any)?.name ?? "—"

  // Fetch course progress
  const { data: progressEntries } = await supabase
    .from("user_progress")
    .select(`
      completion_percentage,
      time_spent,
      is_completed,
      course:courses(
        id,
        subject:subjects(id, name, color)
      )
    `)
    .eq("user_id", profile.id)

  // Fetch exam statistics
  const { data: examStats } = await supabase
    .from('user_subject_exam_stats')
    .select('*')
    .eq('user_id', profile.id)
    .order('total_submissions', { ascending: false })

  const { data: overallExamStats } = await supabase
    .from('user_overall_exam_stats')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  // Process course progress by subject
  const subjectMap = new Map<string, SubjectStats>()

  ;(progressEntries || []).forEach((entry: any) => {
    const subject = entry.course?.subject
    if (!subject?.id) return
    if (!subjectMap.has(subject.id)) {
      subjectMap.set(subject.id, {
        id: subject.id,
        name: subject.name,
        color: subject.color ?? null,
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0,
        timeSpent: 0,
      })
    }
    const stats = subjectMap.get(subject.id)!
    stats.totalCourses += 1
    stats.timeSpent += entry.time_spent || 0
    stats.averageProgress += entry.completion_percentage || 0
    if (entry.is_completed || (entry.completion_percentage || 0) >= 100) {
      stats.completedCourses += 1
    }
  })

  const subjects = Array.from(subjectMap.values()).map((subject) => ({
    ...subject,
    averageProgress: subject.totalCourses
      ? Math.round(subject.averageProgress / subject.totalCourses)
      : 0,
  }))

  const overallProgress = subjects.length
    ? Math.round(
        subjects.reduce((sum, subject) => sum + subject.averageProgress, 0) / subjects.length
      )
    : 0

  const hasCourseData = subjects.length > 0
  const hasExamData = examStats && examStats.length > 0

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Statistiques et maîtrise</h1>
        <p className="text-sm text-muted-foreground">
          Visualisez votre progression par matière et suivez vos performances aux examens.
        </p>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maîtrise globale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matières suivies</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">Série {seriesName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Examens passés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallExamStats?.total_exam_submissions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallExamStats?.total_completed_exams || 0} terminés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne examens</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallExamStats?.overall_average_score 
                ? `${overallExamStats.overall_average_score.toFixed(1)}/20`
                : '—'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {overallExamStats?.overall_average_score
                ? `${((overallExamStats.overall_average_score / 20) * 100).toFixed(0)}%`
                : 'Aucun examen'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content: Course Progress and Exam Stats */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Progression cours
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2">
            <FileText className="h-4 w-4" />
            Performance examens
          </TabsTrigger>
        </TabsList>

        {/* Course Progress Tab */}
        <TabsContent value="courses" className="space-y-4">
          {hasCourseData ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject) => (
                <Card key={subject.id} className="border-muted-foreground/10 bg-muted/10">
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {subject.name}
                      </Badge>
                      {subject.color && (
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                      )}
                    </div>
                    <CardTitle className="text-lg">{subject.averageProgress}% maîtrisé</CardTitle>
                    <CardDescription>
                      {subject.completedCourses}/{subject.totalCourses} cours terminés
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={subject.averageProgress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Temps total
                      </span>
                      <span>{formatMinutes(subject.timeSpent)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <CardTitle className="mb-2 text-lg">Aucun cours commencé</CardTitle>
                <CardDescription>
                  Commencez un cours pour voir votre progression par matière.
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Exam Stats Tab */}
        <TabsContent value="exams" className="space-y-4">
          {hasExamData ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {examStats.map((stat: any) => (
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
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <CardTitle className="mb-2 text-lg">Aucun examen soumis</CardTitle>
                <CardDescription>
                  Passez des examens pour voir vos statistiques ici. 
                  Rendez-vous dans la section Simulation pour démarrer.
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
