import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, BookOpen } from 'lucide-react'
import { StudentCourseFilters } from '@/components/educational/student-course-filters'

function formatDifficulty(level: number | null) {
  switch (level) {
    case 1: return { label: 'Débutant', className: 'bg-green-100 text-green-800' }
    case 2: return { label: 'Facile', className: 'bg-blue-100 text-blue-800' }
    case 3: return { label: 'Intermédiaire', className: 'bg-yellow-100 text-yellow-800' }
    case 4: return { label: 'Avancé', className: 'bg-orange-100 text-orange-800' }
    case 5: return { label: 'Expert', className: 'bg-red-100 text-red-800' }
    default: return { label: 'Non défini', className: 'bg-gray-100 text-gray-800' }
  }
}

export default async function StudentCoursesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const search = (sp?.search as string) || ''
  const subjectId = (sp?.subject_id as string) || ''
  const topicId = (sp?.topic_id as string) || ''
  const sort = (sp?.sort as string) || 'recommended'
  const tagIdsParam = (sp?.tag_ids as string) || ''
  const tagIds = tagIdsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

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

  let coursesQuery = supabase
    .from('searchable_courses')
    .select('*')
    .eq('status', 'published')
    .contains('country_ids', [profile.country_id])
    .contains('series_ids', [profile.series_id])

  if (search) {
    coursesQuery = coursesQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (subjectId) {
    coursesQuery = coursesQuery.eq('subject_id', subjectId)
  }

  if (topicId) {
    coursesQuery = coursesQuery.eq('topic_id', topicId)
  }

  if (tagIds.length > 0) {
    coursesQuery = coursesQuery.overlaps('tag_ids', tagIds)
  }

  switch (sort) {
    case 'newest':
      coursesQuery = coursesQuery.order('created_at', { ascending: false })
      break
    case 'popular':
      coursesQuery = coursesQuery.order('view_count', { ascending: false })
      break
    case 'difficulty':
      coursesQuery = coursesQuery.order('difficulty_level', { ascending: false })
      break
    default:
      coursesQuery = coursesQuery.order('updated_at', { ascending: false })
  }

  const [
    { data: courses },
    { data: progress },
    { data: subjects },
    { data: topics },
    { data: tags },
  ] = await Promise.all([
    coursesQuery,
    supabase
      .from('user_progress')
      .select('course_id, completion_percentage, time_spent')
      .eq('user_id', profile.id),
    supabase.from('subjects').select('id, name, color').order('name'),
    supabase
      .from('topics')
      .select('id, name, subject_id, subjects(name)')
      .order('position', { ascending: true })
      .order('name', { ascending: true }),
    supabase.from('tags').select('id, name, color, type').order('name'),
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

      <StudentCourseFilters
        search={search}
        subjectId={subjectId}
        topicId={topicId}
        tagIds={tagIds}
        sort={sort}
        subjects={(subjects || []) as any}
        topics={(topics || []).map((topic: any) => ({
          id: topic.id,
          name: topic.name,
          subject_id: topic.subject_id,
          subject_name: topic.subjects?.name ?? null,
        }))}
        tags={(tags || []) as any}
        countryName={profile.country?.name}
        seriesName={profile.series?.name}
      />

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
              <Link key={course.id} href={`/student/courses/${course.id}`} className="block">
                <Card className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{course.subject_name}</Badge>
                    <Badge className={difficulty.className}>{difficulty.label}</Badge>
                  </div>
                  {course.topic_name && (
                    <Badge variant="secondary" className="w-fit text-xs">
                      {course.topic_name}
                    </Badge>
                  )}
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
                    {course.estimated_duration ? `${course.estimated_duration} minutes` : 'Durée non définie'}
                  </div>

                  {Array.isArray(course.tag_names) && course.tag_names.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {course.tag_names.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {course.tag_names.length > 3 ? (
                        <Badge variant="outline" className="text-xs">
                          +{course.tag_names.length - 3}
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}

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
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
