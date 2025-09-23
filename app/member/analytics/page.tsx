import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Brain, FileText, Users } from 'lucide-react'

export default async function MemberAnalyticsPage() {
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

  const { data: series } = await supabase
    .from('series')
    .select('id')
    .eq('country_id', profile.country_id)

  const seriesIds = (series || []).map((item) => item.id)

  const courseCountPromise = supabase
    .from('searchable_courses')
    .select('id', { count: 'exact', head: true })
    .contains('country_ids', [profile.country_id])

  const examsCountPromise = seriesIds.length === 0
    ? Promise.resolve({ count: 0 })
    : supabase
        .from('exams')
        .select('id', { count: 'exact', head: true })
        .in('series_id', seriesIds)

  const quizCountPromise = seriesIds.length === 0
    ? Promise.resolve({ count: 0 })
    : supabase
        .from('quiz_exercises')
        .select('id', { count: 'exact', head: true })
        .in('series_id', seriesIds)

  const studentCountPromise = supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'user')
    .eq('country_id', profile.country_id)

  const [coursesAgg, examsAgg, quizAgg, studentsAgg] = await Promise.all([
    courseCountPromise,
    examsCountPromise,
    quizCountPromise,
    studentCountPromise,
  ])

  const metrics = [
    {
      label: 'Cours publiés',
      count: coursesAgg.count || 0,
      icon: BookOpen,
    },
    {
      label: 'Examens disponibles',
      count: examsAgg.count || 0,
      icon: FileText,
    },
    {
      label: 'Quiz & exercices',
      count: quizAgg.count || 0,
      icon: Brain,
    },
    {
      label: 'Étudiants inscrits',
      count: studentsAgg.count || 0,
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analyse locale</h1>
        <p className="text-muted-foreground">
          Indicateurs clés pour {(profile.country as any)?.name}. Ces statistiques s'actualisent en temps réel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, count, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
