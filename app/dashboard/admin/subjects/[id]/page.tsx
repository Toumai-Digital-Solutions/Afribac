import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubjectModal } from '@/components/modals/subject-modal'
import { ArrowLeft, Edit, BookOpen, FileText, Globe, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface SubjectDetailsPageProps {
  params: {
    id: string
  }
}

export default async function SubjectDetailsPage({ params }: SubjectDetailsPageProps) {
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

  // Get subject with related data
  const { data: subject } = await supabase
    .from('subjects')
    .select(`
      *,
      series_subjects (
        id,
        coefficient,
        series:series(
          id,
          name,
          description,
          country:countries(*)
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!subject) {
    notFound()
  }

  // Get additional stats
  const { count: totalSeries } = await supabase
    .from('series_subjects')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', params.id)

  // Group series by country
  const seriesByCountry = subject.series_subjects?.reduce((acc: any, seriesSubject: any) => {
    const countryName = seriesSubject.series.country.name
    if (!acc[countryName]) {
      acc[countryName] = []
    }
    acc[countryName].push(seriesSubject)
    return acc
  }, {}) || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/admin/subjects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold">{subject.name}</h1>
            </div>
            {subject.description && (
              <p className="text-muted-foreground mb-1">{subject.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Créé le {new Date(subject.created_at).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <SubjectModal
          mode="edit"
          initialData={subject}
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
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Séries</p>
                <p className="text-2xl font-bold">{totalSeries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pays</p>
                <p className="text-2xl font-bold">{Object.keys(seriesByCountry).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Coeff. moyen</p>
                <p className="text-2xl font-bold">
                  {subject.series_subjects?.length ? 
                    Math.round((subject.series_subjects.reduce((sum: number, item: any) => sum + item.coefficient, 0) / subject.series_subjects.length) * 10) / 10 
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Series by Country */}
      {Object.keys(seriesByCountry).length > 0 && (
        <div className="space-y-6">
          {Object.entries(seriesByCountry).map(([countryName, countrySeries]: [string, any]) => (
            <Card key={countryName}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    {countryName} ({countrySeries.length})
                  </CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/admin/series?country=${countrySeries[0].series.country.id}`} className="flex items-center gap-1">
                      Voir les séries
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
                <CardDescription>
                  Séries utilisant cette matière dans {countryName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {countrySeries.map((seriesSubject: any) => (
                    <div key={seriesSubject.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{seriesSubject.series.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            Coeff. {seriesSubject.coefficient}
                          </Badge>
                        </div>
                        {seriesSubject.series.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {seriesSubject.series.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {seriesSubject.series.country.code}
                          </Badge>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/admin/series/${seriesSubject.series.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Series Associated */}
      {Object.keys(seriesByCountry).length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Séries associées
            </CardTitle>
            <CardDescription>
              Séries utilisant cette matière
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucune série associée</h3>
              <p className="mb-4">Cette matière n'est associée à aucune série pour le moment.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/admin/series">
                  Gérer les séries
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Gérer les éléments liés à cette matière
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/dashboard/admin/series">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Gérer les séries</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/dashboard/admin/countries">
                <Globe className="h-5 w-5" />
                <span className="text-sm">Voir les pays</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/dashboard/content/create">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Créer du contenu</span>
              </Link>
            </Button>
            <SubjectModal
              mode="edit"
              initialData={subject}
              trigger={
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Edit className="h-5 w-5" />
                  <span className="text-sm">Modifier matière</span>
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
