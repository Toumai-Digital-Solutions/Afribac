import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, FileText, Clock } from 'lucide-react'
import type { ProfileWithDetails } from '@/types/database'

export default async function StudentQuizPage() {
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

  const typedProfile = profile as ProfileWithDetails | null

  if (!typedProfile) {
    redirect('/auth/onboarding')
  }

  if (!typedProfile.country_id || !typedProfile.series_id) {
    redirect('/auth/onboarding/location')
  }

  const { data: activities } = await supabase
    .from('quiz_exercise_details')
    .select('*')
    .eq('status', 'published')
    .eq('series_id', typedProfile.series_id)
    .order('updated_at', { ascending: false })

  const items = activities || []
  const quizzes = items.filter((item) => item.content_type === 'quiz')
  const exercises = items.filter((item) => item.content_type === 'exercise')

  const renderItems = (list: typeof items) => (
    list.length === 0 ? (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Aucun contenu publié pour le moment.
        </CardContent>
      </Card>
    ) : (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((item) => (
          <Link key={item.id} href={`/student/quiz/${item.id}`} className="block">
            <Card className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{item.subject_name}</Badge>
                  <Badge>{item.difficulty_level ?? 1}/5</Badge>
                </div>
                <CardTitle className="line-clamp-2 text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground flex-1">
                {item.description && (
                  <p className="line-clamp-3">{item.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {item.estimated_duration || 20} minutes
                </div>
                {item.tag_names?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tag_names.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tag_names.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tag_names.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    )
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quiz & Exercices</h1>
          <p className="text-muted-foreground">
            Contenus disponibles pour {typedProfile.series?.name} • {typedProfile.country?.name}
          </p>
        </div>
      </div>

      <Tabs defaultValue="quiz" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Brain className="h-4 w-4" /> Quiz ({quizzes.length})
          </TabsTrigger>
          <TabsTrigger value="exercise" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Exercices ({exercises.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="quiz" className="space-y-4">
          {renderItems(quizzes)}
        </TabsContent>
        <TabsContent value="exercise" className="space-y-4">
          {renderItems(exercises)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
