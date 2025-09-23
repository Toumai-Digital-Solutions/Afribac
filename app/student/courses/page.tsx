import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, BookOpen } from 'lucide-react'

function formatDifficulty(level: number) {
  switch (level) {
    case 1: return { label: 'Débutant', className: 'bg-green-100 text-green-800' }
    case 2: return { label: 'Facile', className: 'bg-blue-100 text-blue-800' }
    case 3: return { label: 'Intermédiaire', className: 'bg-yellow-100 text-yellow-800' }
    case 4: return { label: 'Avancé', className: 'bg-orange-100 text-orange-800' }
    case 5: return { label: 'Expert', className: 'bg-red-100 text-red-800' }
    default: return { label: 'Non défini', className: 'bg-gray-100 text-gray-800' }
  }
}

export default async function StudentCoursesPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) {
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

  const [{ data: courses }, { data: progress }] = await Promise.all([
    supabase
      .from('searchable_courses')
      .select('*')
      .eq('status', 'publish')
      .contains('country_ids', [profile.country_id])
      .contains('series_ids', [profile.series_id])
      .order('updated_at', { ascending: false }),
    supabase
      .from('user_progress')
      .select('course_id, completion_percentage, time_spent')
      .eq('user_id', profile.id)
  ])

  const progressByCourse = new Map<string, { completion: number; time: number }>()
  ;(progress || []).forEach((item) => {
    progressByCourse.set(item.course_id, {
      completion: item.completion_percentage || 0,
      time: item.time_spent || 0,
    })
  })

  const availableCourses = courses || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cours pour {profile.series?.name}</h1>
          <p className="text-muted-foreground">
            Retrouvez ici tous les cours publiés pour {profile.country?.name}
          </p>
        </div>
      </div>

      {availableCourses.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Aucun cours disponible pour le moment</h2>
            <p className="text-sm text-muted-foreground">
              Les enseignants de votre pays n'ont pas encore publié de cours pour votre série.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {availableCourses.map((course) => {
            const progressInfo = progressByCourse.get(course.id) || { completion: 0, time: 0 }
            const difficulty = formatDifficulty(course.difficulty_level)

            return (
              <Card key={course.id} className="flex flex-col">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{course.subject_name}</Badge>
                    <Badge className={difficulty.className}>{difficulty.label}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  {course.country_names?.length > 0 && (
                    <CardDescription>
                      Disponible dans {course.country_names.join(', ')}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {course.estimated_duration} minutes
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progression</span>
                      <span>{Math.round(progressInfo.completion)}%</span>
                    </div>
                    <Progress value={progressInfo.completion} className="h-2" />
                  </div>

                  {progressInfo.time > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Temps passé : {Math.round(progressInfo.time)} min
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
