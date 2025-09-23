import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function MemberStudentsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, country_id, country:countries(name)')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/onboarding')
  }

  if (profile.role !== 'member') {
    redirect('/dashboard')
  }

  const { data: students } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      status,
      created_at,
      series:series(name, description)
    `)
    .eq('role', 'user')
    .eq('country_id', profile.country_id)
    .order('created_at', { ascending: false })

  const records = students || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Élèves de {(profile.country as any)?.name}</h1>
        <p className="text-muted-foreground">
          Surveillez l'inscription des étudiants et attribuez les ressources adaptées.
        </p>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucun étudiant inscrit pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((student) => (
            <Card key={student.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {student.full_name || 'Étudiant sans nom'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
                <Badge variant={student.status === 'active' ? 'secondary' : 'outline'}>
                  {student.status === 'active' ? 'Actif' : student.status}
                </Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground flex gap-6 flex-wrap">
                <span>
                  Série : {student.series?.[0].name || 'Non renseignée'}
                  {student.series?.[0].description ? ` • ${student.series?.[0].description}` : ''}
                </span>
                <span>
                  Inscription : {formatDistanceToNow(new Date(student.created_at), { addSuffix: true, locale: fr })}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
