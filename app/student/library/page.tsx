import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bookmark,
  BookOpen,
  CalendarClock,
  Compass,
  Clock,
  FileText,
  Globe2,
  Layers,
  Search,
  Sparkles,
  Wand2
} from 'lucide-react'

const MAX_RESULTS = 6

function formatDifficulty(level: number | null): string {
  switch (level) {
    case 1:
      return 'Débutant'
    case 2:
      return 'Facile'
    case 3:
      return 'Intermédiaire'
    case 4:
      return 'Avancé'
    case 5:
      return 'Expert'
    default:
      return 'Tous niveaux'
  }
}

function formatMinutes(value: number | null) {
  if (!value) return '0 min'
  if (value < 60) return `${Math.round(value)} min`
  const hours = value / 60
  return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)} h`
}

export default async function StudentLibraryPage({
  searchParams
}: {
  searchParams?: { q?: string }
}) {
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

  const { data: progressEntries } = await supabase
    .from('user_progress')
    .select(`
      course_id,
      completion_percentage,
      time_spent,
      last_accessed,
      is_completed,
      bookmarks,
      course:courses(
        id,
        title,
        description,
        estimated_duration,
        difficulty_level,
        subject:subjects(name, color),
        topic:topics(name)
      )
    `)
    .eq('user_id', profile.id)
    .order('last_accessed', { ascending: false })

  const progressCourses = (progressEntries || []).filter((entry) => entry.course)
  const inProgress = progressCourses.filter(
    (entry) => !entry.is_completed && (entry.completion_percentage || 0) > 0
  )
  const completed = progressCourses.filter(
    (entry) => entry.is_completed || (entry.completion_percentage || 0) >= 100
  )
  const saved = progressCourses.filter(
    (entry) => Array.isArray(entry.bookmarks) && (entry.bookmarks as any[]).length > 0
  )

  const query = searchParams?.q?.trim() ?? ''

  let coursesQuery = supabase
    .from('searchable_courses')
    .select('*')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(30)

  if (query) {
    coursesQuery = coursesQuery.ilike('title', `%${query}%`)
  }

  let examsQuery = supabase
    .from('exam_details')
    .select('*')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(30)

  if (query) {
    examsQuery = examsQuery.ilike('title', `%${query}%`)
  }

  const [{ data: courses }, { data: exams }] = await Promise.all([coursesQuery, examsQuery])

  const uniqueCountries = new Set<string>()
  const uniqueSeries = new Set<string>()

  ;(courses ?? []).forEach(course => {
    ;(course.country_names as string[] | null)?.forEach(name => uniqueCountries.add(name))
    ;(course.series_names as string[] | null)?.forEach(name => uniqueSeries.add(name))
  })

  ;(exams ?? []).forEach(exam => {
    if (exam.country_name) uniqueCountries.add(exam.country_name as string)
    if (exam.series_name) uniqueSeries.add(exam.series_name as string)
  })

  const topCourses = (courses ?? []).slice(0, MAX_RESULTS)
  const topExams = (exams ?? []).slice(0, MAX_RESULTS)

  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-3xl border bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium uppercase text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Bibliothèque globale Afribac
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold lg:text-4xl">
              Explorez les cours et examens de tout le réseau
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Accédez librement aux ressources des différents pays et séries. Utilisez la recherche intelligente pour créer votre parcours personnalisé ou tout simplement pour découvrir de nouvelles approches.
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row" action="/student/library" method="get">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Rechercher un titre, une matière ou un mot-clé"
                defaultValue={query}
                className="h-12 rounded-2xl pl-10 text-base"
              />
            </div>
            <Button type="submit" variant="secondary" className="h-12 rounded-2xl px-6 text-sm font-medium">
              Lancer la recherche
            </Button>
          </form>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1">
              <Globe2 className="h-3.5 w-3.5" />
              {uniqueCountries.size || '—'} pays représentés
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1">
              <Layers className="h-3.5 w-3.5" />
              {uniqueSeries.size || '—'} séries couvertes
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1">
              <Wand2 className="h-3.5 w-3.5" />
              Suggestion : « Probabilités », « Sujet 2023 », « Dissertation »
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex h-full w-full max-w-sm flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-primary/30 bg-white/60 p-6 text-center text-sm text-muted-foreground shadow-sm">
            <div className="aspect-square w-40 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-primary/30" />
            <p>
              Placeholder illustration · Lottie
              <br />
              (future animation étudiant·e explorant la bibliothèque)
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Ma bibliothèque personnelle</h2>
            <p className="text-sm text-muted-foreground">
              Retrouvez vos cours sauvegardés, en cours et terminés.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-3 py-1">
              <Compass className="h-3.5 w-3.5" />
              {inProgress.length} en cours
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-3 py-1">
              <Bookmark className="h-3.5 w-3.5" />
              {saved.length} sauvegardés
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-3 py-1">
              <BookOpen className="h-3.5 w-3.5" />
              {completed.length} terminés
            </span>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="in-progress">En cours</TabsTrigger>
            <TabsTrigger value="saved">Sauvegardés</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
          </TabsList>

          {([
            { value: 'all', items: progressCourses, empty: 'Commencez un cours pour le retrouver ici.' },
            { value: 'in-progress', items: inProgress, empty: 'Aucun cours en cours pour le moment.' },
            { value: 'saved', items: saved, empty: 'Ajoutez un marque-page dans un PDF pour sauvegarder un cours.' },
            { value: 'completed', items: completed, empty: 'Terminez un cours pour le voir apparaître ici.' },
          ] as const).map((section) => (
            <TabsContent key={section.value} value={section.value}>
              {section.items.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {section.items.map((entry) => {
                    const course = Array.isArray(entry.course) ? entry.course[0] : entry.course
                    const subject = Array.isArray(course?.subject) ? course.subject[0] : course?.subject
                    const topic = Array.isArray(course?.topic) ? course.topic[0] : course?.topic

                    return (
                    <Card key={entry.course_id} className="border-muted-foreground/10 bg-muted/10">
                      <CardHeader className="space-y-3">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {subject?.name ? (
                            <Badge variant="secondary" className="rounded-full bg-white text-foreground">
                              {subject.name}
                            </Badge>
                          ) : null}
                          {topic?.name ? (
                            <Badge variant="outline" className="rounded-full">
                              {topic.name}
                            </Badge>
                          ) : null}
                          <Badge variant="outline" className="rounded-full">
                            {formatDifficulty(course?.difficulty_level ?? null)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          {course?.title}
                        </CardTitle>
                        {course?.description ? (
                          <CardDescription className="leading-relaxed text-muted-foreground">
                            {course.description}
                          </CardDescription>
                        ) : null}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progression</span>
                            <span>{Math.round(entry.completion_percentage || 0)}%</span>
                          </div>
                          <Progress value={entry.completion_percentage || 0} className="h-2" />
                        </div>
                        <div className="grid gap-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            Temps passé: {formatMinutes(entry.time_spent ?? 0)}
                          </span>
                          {entry.last_accessed ? (
                            <span className="inline-flex items-center gap-2">
                              <CalendarClock className="h-3.5 w-3.5" />
                              Dernier accès {formatDistanceToNow(new Date(entry.last_accessed), { addSuffix: true, locale: fr })}
                            </span>
                          ) : null}
                        </div>
                        <Link href={`/student/courses/${entry.course_id}`} className="block">
                          <Button variant="outline" className="w-full rounded-2xl text-sm">
                            {entry.is_completed ? 'Revoir le cours' : 'Continuer'}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center gap-3 py-12 text-sm text-muted-foreground">
                    <BookOpen className="h-10 w-10" />
                    {section.empty}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Explorer les cours ouverts</h2>
            <p className="text-sm text-muted-foreground">
              {query ? `Résultats pour « ${query} »` : 'Sélection récente tous pays confondus'}
            </p>
          </div>
          <Link href="/student/courses" className="inline-flex">
            <Button variant="outline" className="rounded-2xl px-4 text-sm">
              Voir mes cours ciblés
            </Button>
          </Link>
        </div>

        {topCourses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topCourses.map(course => (
              <Card key={course.id} className="border-muted-foreground/10 bg-muted/20 backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {course.subject_name ? (
                      <Badge variant="secondary" className="rounded-full bg-white text-foreground">
                        {course.subject_name}
                      </Badge>
                    ) : null}
                    {course.topic_name ? (
                      <Badge variant="outline" className="rounded-full">
                        {course.topic_name}
                      </Badge>
                    ) : null}
                    {course.series_names && course.series_names.length > 0 ? (
                      <Badge variant="outline" className="rounded-full">
                        {course.series_names[0]}
                      </Badge>
                    ) : null}
                    <Badge variant="outline" className="rounded-full">
                      {formatDifficulty(course.difficulty_level as number | null)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {course.title}
                  </CardTitle>
                  {course.description ? (
                    <CardDescription className="leading-relaxed text-muted-foreground">
                      {course.description}
                    </CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 text-xs text-muted-foreground">
                    {course.country_names && course.country_names.length > 0 ? (
                      <span>Pays : {course.country_names.slice(0, 3).join(', ')}{course.country_names.length > 3 ? '…' : ''}</span>
                    ) : null}
                    {course.tag_names && course.tag_names.length > 0 ? (
                      <span>Mots-clés : {course.tag_names.slice(0, 3).join(', ')}{course.tag_names.length > 3 ? '…' : ''}</span>
                    ) : null}
                  </div>
                  <Link href={`/student/courses/${course.id}`} className="block">
                    <Button variant="outline" className="w-full rounded-2xl text-sm">
                      Ouvrir le cours
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-sm text-muted-foreground">
              <BookOpen className="h-10 w-10" />
              Aucun cours ne correspond à votre recherche. Essayez de modifier votre mot-clé ou explorez une matière voisine.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Annales et sujets officiels</h2>
            <p className="text-sm text-muted-foreground">
              Retrouvez les examens clés à travers le réseau Afribac
            </p>
          </div>
          <Link href="/student/exams" className="inline-flex">
            <Button variant="outline" className="rounded-2xl px-4 text-sm">
              Voir les examens de ma série
            </Button>
          </Link>
        </div>

        {topExams.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topExams.map(exam => (
              <Card key={exam.id} className="border-muted-foreground/10 bg-muted/10">
                <CardHeader className="space-y-2">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {exam.subject_name ? (
                      <Badge variant="secondary" className="rounded-full bg-white text-foreground">
                        {exam.subject_name}
                      </Badge>
                    ) : null}
                    {exam.series_name ? (
                      <Badge variant="outline" className="rounded-full">
                        {exam.series_name}
                      </Badge>
                    ) : null}
                    {exam.exam_year ? (
                      <Badge variant="outline" className="rounded-full">
                        Session {exam.exam_year}
                      </Badge>
                    ) : null}
                  </div>
                  <CardTitle className="text-base leading-snug">
                    {exam.title}
                  </CardTitle>
                  {exam.description ? (
                    <CardDescription className="leading-relaxed text-muted-foreground">
                      {exam.description}
                    </CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 text-xs text-muted-foreground">
                    {exam.country_name ? <span>Pays : {exam.country_name}</span> : null}
                    {exam.duration_minutes ? <span>Durée : {exam.duration_minutes} min</span> : null}
                    {exam.total_points ? <span>Points : {exam.total_points}</span> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/student/exams/${exam.id}`} className="flex-1">
                      <Button size="sm" className="w-full rounded-2xl text-xs">
                        Consulter le sujet
                      </Button>
                    </Link>
                    <Link href={`/student/exams/${exam.id}?tab=correction`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full rounded-2xl text-xs">
                        Voir la correction
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-sm text-muted-foreground">
              <FileText className="h-10 w-10" />
              Aucun examen n'a été publié pour l'instant. Revenez bientôt ou parcourez d'autres séries pour rester inspiré.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="rounded-3xl border bg-muted/30 p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Besoin d&apos;idées ?</h2>
            <p className="text-sm text-muted-foreground">
              Utilisez la bibliothéque comme un laboratoire : comparez les programmes de plusieurs pays, préparez vos révisions à l&apos;avance et sauvegardez vos trouvailles dans vos favoris.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1">
                <Compass className="h-3.5 w-3.5" />
                Découverte guidée
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1">
                <BookOpen className="h-3.5 w-3.5" />
                Parcours thématiques
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex h-full w-full max-w-xs items-center justify-center rounded-3xl border border-dashed border-muted-foreground/30 bg-background/70 p-6 text-center text-xs text-muted-foreground">
              Future illustration : étudiant·e construisant sa bibliothèque personnelle
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
