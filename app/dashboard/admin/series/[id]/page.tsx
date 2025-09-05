import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SeriesModal } from '@/components/modals/series-modal'
import { ArrowLeft, Edit, FileText, Globe, BookOpen, Users, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface SeriesDetailsPageProps {
  params: {
    id: string
  }
}

export default async function SeriesDetailsPage({ params }: SeriesDetailsPageProps) {
  const supabase = await createClient()
  
  // Get the current user and check permissions
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get series with related data
  const { data: series } = await supabase
    .from('series')
    .select(`
      *,
      country:countries(*),
      series_subjects (
        id,
        coefficient,
        subject:subjects(*)
      ),
      profiles (
        id,
        full_name,
        email,
        role,
        status,
        created_at
      )
    `)
    .eq('id', params.id)
    .single()

  if (!series) {
    notFound()
  }

  // Get additional stats
  const [
    { count: totalStudents },
    { count: totalSubjects }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('series_id', params.id).eq('role', 'user'),
    supabase.from('series_subjects').select('*', { count: 'exact', head: true }).eq('series_id', params.id)
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/admin/series">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-green-600" />
                <h1 className="text-3xl font-bold">{series.name}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <Badge variant="outline" className="text-sm px-2 py-1">
                  {series.country.name} ({series.country.code})
                </Badge>
              </div>
            </div>
            {series.description && (
              <p className="text-muted-foreground mb-1">{series.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Créé le {new Date(series.created_at).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <SeriesModal
          mode="edit"
          initialData={series}
          trigger={
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          }
        />
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Matières</p>
                <p className="text-2xl font-bold">{totalSubjects || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Étudiants</p>
                <p className="text-2xl font-bold">{totalStudents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pays</p>
                <p className="text-lg font-bold">{series.country.code}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Matières ({totalSubjects || 0})
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin/subjects" className="flex items-center gap-1">
                  Gérer
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Matières enseignées dans cette série
            </CardDescription>
          </CardHeader>
          <CardContent>
            {series.series_subjects && series.series_subjects.length > 0 ? (
              <div className="space-y-3">
                {series.series_subjects.map((seriesSubject: any) => (
                  <div key={seriesSubject.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{seriesSubject.subject.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          Coeff. {seriesSubject.coefficient}
                        </Badge>
                      </div>
                      {seriesSubject.subject.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {seriesSubject.subject.description}
                        </p>
                      )}
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/admin/subjects/${seriesSubject.subject.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune matière associée</p>
                <Button asChild variant="link" size="sm" className="mt-2">
                  <Link href={`/dashboard/admin/series/${series.id}/subjects`}>
                    Associer des matières
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Étudiants ({totalStudents || 0})
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/admin/users?series=${series.id}`} className="flex items-center gap-1">
                  Voir tous
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Étudiants inscrits dans cette série
            </CardDescription>
          </CardHeader>
          <CardContent>
            {series.profiles && series.profiles.length > 0 ? (
              <div className="space-y-3">
                {series.profiles.slice(0, 5).map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium">{student.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {student.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(student.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {series.profiles.length > 5 && (
                  <div className="text-center pt-2">
                    <Button asChild variant="link" size="sm">
                      <Link href={`/dashboard/admin/users?series=${series.id}`}>
                        Voir {series.profiles.length - 5} autres étudiants
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun étudiant inscrit</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Gérer les éléments liés à cette série
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href={`/dashboard/admin/series/${series.id}/subjects`}>
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Associer matières</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href={`/dashboard/admin/countries/${series.country.id}`}>
                <Globe className="h-5 w-5" />
                <span className="text-sm">Voir le pays</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/dashboard/admin/users">
                <Users className="h-5 w-5" />
                <span className="text-sm">Gérer étudiants</span>
              </Link>
            </Button>
            <SeriesModal
              mode="edit"
              initialData={series}
              trigger={
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Edit className="h-5 w-5" />
                  <span className="text-sm">Modifier série</span>
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
