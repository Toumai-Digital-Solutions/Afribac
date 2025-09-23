import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

function clampProgress(value: number | null) {
  if (!value) return 0
  return Math.min(100, Math.max(0, value))
}

export default async function StudentProgressPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/onboarding')
  }

  const { data: progressEntries } = await supabase
    .from('user_progress')
    .select(`
      *,
      course:courses(
        *,
        subject:subjects(*)
      )
    `)
    .eq('user_id', profile.id)
    .order('last_accessed', { ascending: false })

  const entries = progressEntries || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ma progression</h1>
        <p className="text-muted-foreground">
          Suivez votre avancement sur les cours et exercices que vous avez commencés.
        </p>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Vous n'avez pas encore commencé de cours. Rendez-vous dans l'onglet "Cours" pour démarrer !
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <Card key={entry.course_id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{entry.course?.title || 'Cours inconnu'}</CardTitle>
                  {entry.course?.subject?.name && (
                    <Badge variant="outline" className="mt-2">
                      {entry.course.subject.name}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Dernier accès :{' '}
                  {entry.last_accessed
                    ? formatDistanceToNow(new Date(entry.last_accessed), { addSuffix: true, locale: fr })
                    : 'Jamais'}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Progression</span>
                  <span>{Math.round(clampProgress(entry.completion_percentage))}%</span>
                </div>
                <Progress value={clampProgress(entry.completion_percentage)} className="h-2" />
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Temps passé : {Math.round(entry.time_spent || 0)} min</span>
                  {entry.course?.estimated_duration && (
                    <span>Durée estimée : {entry.course.estimated_duration} min</span>
                  )}
                  <span>
                    Statut : {entry.is_completed ? 'Terminé' : 'En cours'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
