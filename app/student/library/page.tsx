import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { BookOpen, FileText, Globe2, Layers, Search, Sparkles } from 'lucide-react'

function formatDifficulty(level: number | null): { label: string; tone: string } {
  switch (level) {
    case 1:
      return { label: 'Débutant', tone: 'bg-emerald-100 text-emerald-800' }
    case 2:
      return { label: 'Facile', tone: 'bg-sky-100 text-sky-800' }
    case 3:
      return { label: 'Intermédiaire', tone: 'bg-amber-100 text-amber-800' }
    case 4:
      return { label: 'Avancé', tone: 'bg-orange-100 text-orange-800' }
    case 5:
      return { label: 'Expert', tone: 'bg-rose-100 text-rose-800' }
    default:
      return { label: 'Tous niveaux', tone: 'bg-slate-100 text-slate-700' }
  }
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

  const query = searchParams?.q?.trim() ?? ''

  let coursesQuery = supabase
    .from('searchable_courses')
    .select('*')
    .eq('status', 'publish')
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

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Bibliothèque globale
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">Toutes les ressources Afribac à portée de main</h1>
              <p className="text-sm text-muted-foreground">
                Accédez à l'intégralité des cours et examens publiés, quelle que soit la série ou le pays. Construisez votre propre parcours en explorant librement les contenus disponibles.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Globe2 className="h-3.5 w-3.5" /> {uniqueCountries.size || '—'} pays représentés</span>
              <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {uniqueSeries.size || '—'} séries couvertes</span>
            </div>
          </div>
          <div className="w-full max-w-md">
            <form className="flex gap-2" action="/student/library" method="get">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Rechercher un titre, une matière ou un mot-clé"
                  defaultValue={query}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="secondary">
                Chercher
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Astuce : essayez « Probabilités », « Histoire Afrique » ou « Sujet 2023 » pour cibler vos recherches.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Cours ouverts
                </CardTitle>
                <CardDescription>
                  {query
                    ? `Résultats pour « ${query} »`
                    : 'Les cours les plus récents, tous pays confondus'}
                </CardDescription>
              </div>
              <Link href="/student/courses">
                <Button variant="outline" size="sm">
                  Voir mes cours
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map(course => {
                  const difficulty = formatDifficulty(course.difficulty_level as number | null)
                  return (
                    <div key={course.id} className="rounded-xl border bg-muted/20 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {course.subject_name ? (
                              <Badge variant="secondary" className="bg-white text-foreground">
                                {course.subject_name}
                              </Badge>
                            ) : null}
                            {course.series_names && course.series_names.length > 0 ? (
                              <Badge variant="outline">{course.series_names.slice(0, 1)[0]}</Badge>
                            ) : null}
                            <Badge className={difficulty.tone}>{difficulty.label}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold leading-tight">
                            {course.title}
                          </h3>
                          {course.description ? (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          ) : null}
                        </div>
                        <Button size="sm" variant="ghost" className="min-w-fit">
                          Ouvrir
                        </Button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {course.country_names && course.country_names.length > 0 ? (
                          <span>Pays : {course.country_names.slice(0, 3).join(', ')}{course.country_names.length > 3 ? '…' : ''}</span>
                        ) : null}
                        {course.tag_names && course.tag_names.length > 0 ? (
                          <span>Mots-clés : {course.tag_names.slice(0, 3).join(', ')}{course.tag_names.length > 3 ? '…' : ''}</span>
                        ) : null}
                        {course.estimated_duration ? (
                          <span>Durée estimée : {course.estimated_duration} min</span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                Aucun cours ne correspond à votre recherche. Essayez un autre mot-clé ou explorez une matière voisine.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Examens & sujets
                </CardTitle>
                <CardDescription>
                  Retrouvez les annales et sujets officiels pour vous entraîner.
                </CardDescription>
              </div>
              <Link href="/student/exams">
                <Button variant="outline" size="sm">
                  Parcourir les examens
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {exams && exams.length > 0 ? (
              <div className="space-y-4">
                {exams.map(exam => (
                  <div key={exam.id} className="rounded-xl border bg-muted/20 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {exam.subject_name ? (
                            <Badge variant="secondary" className="bg-white text-foreground">
                              {exam.subject_name}
                            </Badge>
                          ) : null}
                          {exam.series_name ? <Badge variant="outline">{exam.series_name}</Badge> : null}
                          {exam.exam_year ? <Badge variant="outline">Session {exam.exam_year}</Badge> : null}
                        </div>
                        <h3 className="text-base font-semibold leading-tight">{exam.title}</h3>
                        {exam.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">{exam.description}</p>
                        ) : null}
                      </div>
                      <Button size="sm" variant="ghost" className="min-w-fit">
                        Réviser
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {exam.country_name ? <span>Pays : {exam.country_name}</span> : null}
                      {exam.duration_minutes ? <span>Durée : {exam.duration_minutes} min</span> : null}
                      {exam.total_points ? <span>Points : {exam.total_points}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                Aucun examen n'est disponible pour cette recherche. Utilisez des mots-clés plus génériques (ex: « mathématiques »).
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
