'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import type { ProfileWithDetails } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  LibraryBig,
  Loader2,
  Play,
  Search,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react'

interface StudentDashboardProps {
  profile: ProfileWithDetails
}

type ContinueCourse = {
  id: string
  title: string
  description: string | null
  subjectName: string
  subjectColor?: string | null
  topicName?: string | null
  estimatedDuration: number | null
  difficultyLevel: number | null
  progress: number
  lastAccessed: string
  timeSpent: number
  isCompleted: boolean
}

type CourseHighlight = {
  id: string
  title: string
  description: string | null
  subjectName?: string | null
  subjectColor?: string | null
  topicName?: string | null
  difficultyLevel?: number | null
  estimatedDuration?: number | null
  countryNames?: string[] | null
  seriesNames?: string[] | null
  createdAt?: string | null
  tagNames?: string[] | null
}

type SimulationHighlight = {
  id: string
  title: string
  description: string | null
  subjectName?: string | null
  subjectColor?: string | null
  durationMinutes?: number | null
  examYear?: number | null
  examSession?: string | null
  totalPoints?: number | null
}

interface DashboardData {
  continueLearning: ContinueCourse[]
  newCourses: CourseHighlight[]
  simulation: SimulationHighlight[]
  stats: {
    activeCourses: number
    completedCourses: number
    averageProgress: number
    totalTimeMinutes: number
  }
  libraryCounts: {
    courses: number
    exams: number
  }
  popularTags: string[]
  coveredCountries: string[]
}

interface LibraryResults {
  courses: CourseHighlight[]
  exams: SimulationHighlight[]
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Débutant',
  2: 'Facile',
  3: 'Intermédiaire',
  4: 'Avancé',
  5: 'Expert'
}

function formatMinutesToHours(minutes: number) {
  if (!minutes) return '0 h'
  if (minutes < 60) return `${minutes} min`
  const hours = minutes / 60
  return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)} h`
}

export function StudentDashboard({ profile }: StudentDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [libraryQuery, setLibraryQuery] = useState('')
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [libraryResults, setLibraryResults] = useState<LibraryResults | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      try {
        const progressPromise = supabase
          .from('user_progress')
          .select(`
            id,
            completion_percentage,
            time_spent,
            last_accessed,
            is_completed,
            course:courses(
              id,
              title,
              description,
              estimated_duration,
              difficulty_level,
              created_at,
              subject:subjects(id, name, color),
              topic:topics(id, name)
            )
          `)
          .eq('user_id', profile.id)
          .order('last_accessed', { ascending: false })
          .limit(6)

        let newCoursesQuery = supabase
          .from('searchable_courses')
          .select('*')
          .eq('status', 'publish')
          .order('created_at', { ascending: false })
          .limit(8)

        if (profile.country_id) {
          newCoursesQuery = newCoursesQuery.contains('country_ids', [profile.country_id])
        }
        if (profile.series_id) {
          newCoursesQuery = newCoursesQuery.contains('series_ids', [profile.series_id])
        }

        let simulationQuery = supabase
          .from('exam_details')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(3)

        if (profile.series_id) {
          simulationQuery = simulationQuery.eq('series_id', profile.series_id)
        }

        const courseCountPromise = supabase
          .from('searchable_courses')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'publish')

        const examCountPromise = supabase
          .from('exam_details')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')

        const [
          progressResult,
          newCoursesResult,
          simulationResult,
          courseCountResult,
          examCountResult
        ] = await Promise.all([
          progressPromise,
          newCoursesQuery,
          simulationQuery,
          courseCountPromise,
          examCountPromise
        ])

        if (!isMounted) return

        if (progressResult.error) throw progressResult.error
        if (newCoursesResult.error) throw newCoursesResult.error
        if (simulationResult.error) throw simulationResult.error
        if (courseCountResult.error) throw courseCountResult.error
        if (examCountResult.error) throw examCountResult.error

        const progressData = (progressResult.data || []).filter((entry) => entry.course) as Array<{
          id: string
          completion_percentage: number
          time_spent: number
          last_accessed: string
          is_completed: boolean
          course: {
            id: string
            title: string
            description: string | null
            estimated_duration: number | null
            difficulty_level: number | null
            created_at: string
            subject: { id: string; name: string; color: string | null } | null
            topic: { id: string; name: string } | null
          }
        }>

        const continueLearning: ContinueCourse[] = progressData.map((entry) => ({
          id: entry.course.id,
          title: entry.course.title,
          description: entry.course.description,
          subjectName: entry.course.subject?.name || 'Cours',
          subjectColor: entry.course.subject?.color,
          topicName: entry.course.topic?.name || null,
          estimatedDuration: entry.course.estimated_duration,
          difficultyLevel: entry.course.difficulty_level,
          progress: entry.completion_percentage || 0,
          lastAccessed: entry.last_accessed,
          timeSpent: entry.time_spent || 0,
          isCompleted: entry.is_completed
        }))

        const newCourses: CourseHighlight[] = (newCoursesResult.data || []).map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          subjectName: course.subject_name,
          subjectColor: course.subject_color,
          topicName: course.topic_name,
          difficultyLevel: course.difficulty_level,
          estimatedDuration: course.estimated_duration,
          countryNames: course.country_names,
          seriesNames: course.series_names,
          createdAt: course.created_at,
          tagNames: course.tag_names
        }))

        const simulation: SimulationHighlight[] = (simulationResult.data || []).map((exam) => ({
          id: exam.id,
          title: exam.title,
          description: exam.description,
          subjectName: exam.subject_name,
          subjectColor: exam.subject_color,
          durationMinutes: exam.duration_minutes,
          examYear: exam.exam_year,
          examSession: exam.exam_session,
          totalPoints: exam.total_points
        }))

        const completedCourses = continueLearning.filter((course) => course.isCompleted).length
        const activeCourses = continueLearning.filter((course) => !course.isCompleted).length
        const averageProgress = continueLearning.length
          ? Math.round(
              continueLearning.reduce((sum, course) => sum + course.progress, 0) /
                continueLearning.length
            )
          : 0
        const totalTimeMinutes = continueLearning.reduce((sum, course) => sum + course.timeSpent, 0)

        const popularTags = Array.from(
          new Set(
            newCourses
              .flatMap((course) => course.tagNames || [])
              .filter((tag): tag is string => Boolean(tag))
          )
        ).slice(0, 6)

        const coveredCountries = Array.from(
          new Set(
            newCourses
              .flatMap((course) => course.countryNames || [])
              .filter((country): country is string => Boolean(country))
          )
        ).slice(0, 6)

        const libraryCounts = {
          courses: courseCountResult.count ?? newCourses.length,
          exams: examCountResult.count ?? simulation.length
        }

        setData({
          continueLearning,
          newCourses,
          simulation,
          stats: {
            activeCourses,
            completedCourses,
            averageProgress,
            totalTimeMinutes
          },
          libraryCounts,
          popularTags,
          coveredCountries
        })
      } catch (err) {
        console.error('Erreur chargement dashboard étudiant:', err)
        if (isMounted) {
          setError("Impossible de charger vos données pour le moment. Veuillez réessayer bientôt.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDashboardData()

    return () => {
      isMounted = false
    }
  }, [profile.id, profile.country_id, profile.series_id])

  useEffect(() => {
    if (!libraryQuery.trim()) {
      setLibraryResults(null)
      return
    }

    let isMounted = true
    const handler = setTimeout(async () => {
      setLibraryLoading(true)
      const supabase = createClient()

      try {
        const [coursesResult, examsResult] = await Promise.all([
          supabase
            .from('searchable_courses')
            .select('*')
            .eq('status', 'publish')
            .ilike('title', `%${libraryQuery}%`)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('exam_details')
            .select('*')
            .eq('status', 'published')
            .ilike('title', `%${libraryQuery}%`)
            .order('created_at', { ascending: false })
            .limit(5)
        ])

        if (!isMounted) return

        if (coursesResult.error) throw coursesResult.error
        if (examsResult.error) throw examsResult.error

        const courses: CourseHighlight[] = (coursesResult.data || []).map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          subjectName: course.subject_name,
          subjectColor: course.subject_color,
          topicName: course.topic_name,
          difficultyLevel: course.difficulty_level,
          estimatedDuration: course.estimated_duration,
          countryNames: course.country_names,
          seriesNames: course.series_names,
          createdAt: course.created_at,
          tagNames: course.tag_names
        }))

        const exams: SimulationHighlight[] = (examsResult.data || []).map((exam) => ({
          id: exam.id,
          title: exam.title,
          description: exam.description,
          subjectName: exam.subject_name,
          subjectColor: exam.subject_color,
          durationMinutes: exam.duration_minutes,
          examYear: exam.exam_year,
          examSession: exam.exam_session,
          totalPoints: exam.total_points
        }))

        setLibraryResults({ courses, exams })
      } catch (err) {
        console.error('Erreur recherche bibliothèque:', err)
        if (isMounted) {
          setLibraryResults({ courses: [], exams: [] })
        }
      } finally {
        if (isMounted) {
          setLibraryLoading(false)
        }
      }
    }, 350)

    return () => {
      isMounted = false
      clearTimeout(handler)
    }
  }, [libraryQuery])

  const firstCourse = useMemo(() => data?.continueLearning?.[0], [data?.continueLearning])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-44 rounded-3xl bg-muted animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-64 rounded-3xl bg-muted animate-pulse" />
          <div className="h-64 rounded-3xl bg-muted animate-pulse" />
        </div>
        <div className="h-72 rounded-3xl bg-muted animate-pulse" />
        <div className="h-80 rounded-3xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center space-y-4">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Tableau de bord indisponible</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
          </div>
          <Button onClick={() => location.reload()}>
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10 opacity-40" aria-hidden />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Accueil étudiant Afribac
            </div>
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Bonjour, {profile.full_name?.split(' ')[0] || 'Étudiant'} 👋
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Retrouvez ici un aperçu clair de votre progression, reprenez votre dernière leçon et explorez les nouvelles ressources sélectionnées pour {profile.series?.name || 'votre programme'}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/student/courses">
                <Button className="bg-white text-primary hover:bg-white/90">
                  <Play className="mr-2 h-4 w-4" />
                  {firstCourse ? `Reprendre "${firstCourse.title}"` : 'Commencer un cours'}
                </Button>
              </Link>
              <Link href="/student/progress">
                <Button variant="ghost" className="border border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Voir ma progression
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex w-full max-w-sm flex-col items-center justify-center gap-4 rounded-3xl border border-white/25 bg-white/10 p-6 text-center text-sm text-white/80 backdrop-blur">
            <div className="aspect-square w-36 rounded-full bg-gradient-to-br from-white/40 via-primary/40 to-white/30" />
            <p>
              Placeholder illustration · Lottie
              <br />
              (future scène d'accueil étudiant·e)
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-muted-foreground/10 bg-muted/20 p-5">
          <p className="text-xs uppercase text-muted-foreground">Cours en cours</p>
          <p className="mt-3 text-3xl font-semibold">{data.stats.activeCourses}</p>
          <p className="mt-1 text-xs text-muted-foreground">Reprenez là où vous vous êtes arrêté·e.</p>
        </div>
        <div className="rounded-2xl border border-muted-foreground/10 bg-muted/20 p-5">
          <p className="text-xs uppercase text-muted-foreground">Cours terminés</p>
          <p className="mt-3 text-3xl font-semibold">{data.stats.completedCourses}</p>
          <p className="mt-1 text-xs text-muted-foreground">Bravo pour vos réussites !</p>
        </div>
        <div className="rounded-2xl border border-muted-foreground/10 bg-muted/20 p-5">
          <p className="text-xs uppercase text-muted-foreground">Temps d'étude</p>
          <p className="mt-3 text-3xl font-semibold">{formatMinutesToHours(data.stats.totalTimeMinutes)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Progression moyenne : {Math.max(data.stats.averageProgress, 0)}%</p>
        </div>
      </section>

      {/* Continue learning & Simulation */}
      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle>Reprendre votre apprentissage</CardTitle>
            <CardDescription>
              Vos dernières leçons, prêtes à être terminées.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.continueLearning.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Aucun cours entamé pour le moment</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Lancez-vous en explorant les cours adaptés à votre série et reprenez plus tard en un seul clic.
                </p>
                <Link href="/student/courses">
                  <Button className="mt-4">
                    Découvrir les cours
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.continueLearning.map((course) => (
                  <div key={course.id} className="rounded-2xl border bg-muted/30 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <div
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{ backgroundColor: `${course.subjectColor || '#EEF2FF'}`, color: '#111827' }}
                          >
                            {course.subjectName}
                          </div>
                          {course.topicName && (
                            <Badge variant="outline" className="text-[11px]">
                              {course.topicName}
                            </Badge>
                          )}
                          <span>Dernière activité {formatDistanceToNow(new Date(course.lastAccessed), { locale: fr, addSuffix: true })}</span>
                        </div>
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        {course.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <Badge variant="secondary" className="bg-white text-foreground">
                          {Math.round(course.progress)}%
                        </Badge>
                        {course.difficultyLevel ? (
                          <Badge variant="outline">
                            {DIFFICULTY_LABELS[course.difficultyLevel] || 'Niveau'}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <Progress value={course.progress} className="h-2" />
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>Temps passé : {formatMinutesToHours(course.timeSpent)}</span>
                        {course.estimatedDuration ? (
                          <span>Durée estimée : {formatMinutesToHours(course.estimatedDuration)}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href="/student/courses">
                        <Button size="sm">
                          Continuer le cours
                        </Button>
                      </Link>
                      <Link href="/student/progress">
                        <Button size="sm" variant="ghost">
                          Voir les détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              <CardTitle>Simulation Baccalauréat</CardTitle>
            </div>
            <CardDescription className="text-white/70">
              Entraînez-vous dans des conditions réelles avec les sujets les plus pertinents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {data.simulation.length === 0 ? (
              <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-white/70">
                Aucun examen n'est disponible pour votre série pour le moment. Nous vous préviendrons dès que de nouvelles simulations seront prêtes.
              </div>
            ) : (
              <div className="space-y-3">
                {data.simulation.map((exam) => (
                  <div key={exam.id} className="rounded-xl border border-white/15 bg-white/5 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs uppercase text-white/50">
                          {exam.examSession ? `${exam.examSession} • ` : ''}{exam.examYear || 'Session récente'}
                        </p>
                        <h3 className="text-base font-semibold leading-snug">{exam.title}</h3>
                        {exam.subjectName ? (
                          <p className="text-xs text-white/60">
                            {exam.subjectName}
                          </p>
                        ) : null}
                      </div>
                      {exam.durationMinutes ? (
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {exam.durationMinutes} min
                        </span>
                      ) : null}
                    </div>
                    {exam.description ? (
                      <p className="mt-3 text-xs text-white/65 line-clamp-2">
                        {exam.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
            <Link href="/student/simulation">
              <Button className="w-full bg-white text-slate-900 hover:bg-white/90">
                Lancer une simulation
              </Button>
            </Link>
            <div className="rounded-xl border border-dashed border-white/20 p-4 text-xs text-white/60">
              <p className="font-medium text-white">Comment ça marche ?</p>
              <ul className="mt-2 space-y-1">
                <li>1. Choisissez une simulation adaptée à votre série.</li>
                <li>2. Répondez aux questions dans le temps imparti.</li>
                <li>3. Obtenez une analyse claire de vos réponses.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* New courses */}
      <section>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Nouveaux cours pour vous</CardTitle>
                <CardDescription>
                  Une sélection fraîchement publiée pour rester à jour.
                </CardDescription>
              </div>
              <Link href="/student/courses" className="hidden sm:inline-flex">
                <Button variant="outline" size="sm">
                  Voir tous les cours
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.newCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed py-8 text-center">
                <Compass className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Aucun nouveau cours n'a été publié récemment pour votre série. Revenez bientôt !
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.newCourses.map((course) => (
                  <div key={course.id} className="group rounded-2xl border bg-muted/20 p-4 transition-shadow hover:shadow-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {course.subjectName ? (
                          <div
                            className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium"
                            style={{ backgroundColor: `${course.subjectColor || '#E0F2FE'}`, color: '#0F172A' }}
                          >
                            {course.subjectName}
                          </div>
                        ) : null}
                        {course.topicName && (
                          <Badge variant="outline" className="mt-2 text-[11px]">
                            {course.topicName}
                          </Badge>
                        )}
                        <h3 className="mt-3 text-base font-semibold leading-snug">
                          {course.title}
                        </h3>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    {course.description ? (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                        {course.description}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {course.difficultyLevel ? (
                        <span className="inline-flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" />
                          {DIFFICULTY_LABELS[course.difficultyLevel] || 'Niveau'}
                        </span>
                      ) : null}
                      {course.estimatedDuration ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatMinutesToHours(course.estimatedDuration)}
                        </span>
                      ) : null}
                      {course.createdAt ? (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {format(new Date(course.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      ) : null}
                    </div>
                    {course.tagNames && course.tagNames.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {course.tagNames.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-white">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
            <Link href="/student/courses" className="mt-4 inline-flex sm:hidden">
              <Button variant="outline" className="w-full">
                Explorer tous les cours
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Choisissez votre prochaine étape sans vous submerger d&apos;options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/student/courses">
              <Button className="w-full justify-start rounded-2xl bg-muted/40 text-foreground hover:bg-muted/60">
                <BookOpen className="mr-2 h-4 w-4" />
                Continuer mes cours
              </Button>
            </Link>
            <Link href="/student/exams">
              <Button variant="outline" className="w-full justify-start rounded-2xl">
                <FileText className="mr-2 h-4 w-4" />
                Réviser un examen
              </Button>
            </Link>
            <Link href="/student/simulation">
              <Button variant="outline" className="w-full justify-start rounded-2xl">
                <Play className="mr-2 h-4 w-4" />
                Lancer une simulation
              </Button>
            </Link>
            <Link href="/student/progress">
              <Button variant="outline" className="w-full justify-start rounded-2xl">
                <TrendingUp className="mr-2 h-4 w-4" />
                Suivre ma progression
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center border-dashed border-muted-foreground/30 bg-muted/20 text-xs text-muted-foreground">
          Placeholder illustration · Lottie (tableau de bord minimaliste)
        </Card>
      </section>

      {/* Library */}
      <section>
        <Card className="border-primary/10">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <LibraryBig className="h-5 w-5 text-primary" />
                  <CardTitle>Bibliothèque globale</CardTitle>
                </div>
                <CardDescription>
                  Parcourez tous les cours, examens et ressources disponibles, sans limite de pays ou de série.
                </CardDescription>
              </div>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <span>{data.libraryCounts.courses.toLocaleString('fr-FR')} cours</span>
                <span>•</span>
                <span>{data.libraryCounts.exams.toLocaleString('fr-FR')} examens</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-xl">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un cours, un examen, une matière ou un pays..."
                  className="pl-10"
                  value={libraryQuery}
                  onChange={(event) => setLibraryQuery(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium uppercase">Tags populaires :</span>
                {data.popularTags.length > 0 ? (
                  data.popularTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[11px]">
                      #{tag}
                    </Badge>
                  ))
                ) : (
                  <span>Aucun tag détecté</span>
                )}
              </div>
            </div>

            {libraryQuery.trim().length > 0 ? (
              <div className="space-y-6">
                {libraryLoading ? (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recherche en cours...
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Cours correspondants
                      </h3>
                      {libraryResults && libraryResults.courses.length > 0 ? (
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {libraryResults.courses.map((course) => (
                            <div key={course.id} className="rounded-xl border bg-muted/20 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="font-semibold">{course.title}</h4>
                                  {course.subjectName ? (
                                    <p className="text-xs text-muted-foreground">{course.subjectName}</p>
                                  ) : null}
                                  {course.topicName ? (
                                    <p className="text-xs text-muted-foreground mt-0.5">Thème : {course.topicName}</p>
                                  ) : null}
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                              {course.countryNames && course.countryNames.length > 0 ? (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Pays : {course.countryNames.slice(0, 3).join(', ')}
                                  {course.countryNames.length > 3 ? '…' : ''}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">Aucun cours trouvé pour cette recherche.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Examens correspondants
                      </h3>
                      {libraryResults && libraryResults.exams.length > 0 ? (
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {libraryResults.exams.map((exam) => (
                            <div key={exam.id} className="rounded-xl border bg-muted/20 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="font-semibold">{exam.title}</h4>
                                  {exam.subjectName ? (
                                    <p className="text-xs text-muted-foreground">{exam.subjectName}</p>
                                  ) : null}
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                {exam.examYear ? <span>{exam.examYear}</span> : null}
                                {exam.durationMinutes ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {exam.durationMinutes} min
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">Aucun examen trouvé pour cette recherche.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <h3 className="font-semibold">
                    Explorez par pays
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Accédez aux programmes d'autres pays pour anticiper vos études ou comparer les approches.
                  </p>
                  {data.coveredCountries.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {data.coveredCountries.map((country) => (
                        <Badge key={country} variant="outline">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <h3 className="font-semibold">
                    Comparez les séries
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Recherchez un sujet et visualisez instantanément les variantes par série ou par niveau.
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Astuce : tapez par exemple « Probabilités » ou « Dissertation » pour découvrir du contenu dédié.
                  </div>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <h3 className="font-semibold">
                    Construisez votre parcours
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sauvegardez vos résultats de recherche et créez une bibliothèque personnelle à revisiter.
                  </p>
                  <Link href="/student/courses" className="mt-3 inline-flex">
                    <Button size="sm" variant="ghost" className="gap-1">
                      Commencer
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
