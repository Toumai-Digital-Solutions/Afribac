import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CountryModal } from '@/components/modals/country-modal'
import { ArrowLeft, Edit, Globe, FileText, Users, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface CountryDetailsPageProps {
  params: {
    id: string
  }
}

export default async function CountryDetailsPage({ params }: CountryDetailsPageProps) {
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

  // Get country with related data
  const { data: country } = await supabase
    .from('countries')
    .select(`
      *,
      series (
        id,
        name,
        description,
        created_at,
        profiles:profiles(count)
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

  if (!country) {
    notFound()
  }

  // Get additional stats
  const [
    { count: totalSeries },
    { count: totalUsers },
    { count: totalAdmins },
    { count: totalMembers },
    { count: totalStudents }
  ] = await Promise.all([
    supabase.from('series').select('*', { count: 'exact', head: true }).eq('country_id', params.id),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('country_id', params.id),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('country_id', params.id).eq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('country_id', params.id).eq('role', 'member'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('country_id', params.id).eq('role', 'user')
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/admin/countries">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold">{country.name}</h1>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1 font-mono">
                {country.code}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Créé le {new Date(country.created_at).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <CountryModal
          mode="edit"
          initialData={country}
          trigger={
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          }
        />
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold">{totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Collaborateurs</p>
                <p className="text-2xl font-bold">{totalMembers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Étudiants</p>
                <p className="text-2xl font-bold">{totalStudents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Series Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Séries ({totalSeries || 0})
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/admin/series?country=${country.id}`} className="flex items-center gap-1">
                  Voir toutes
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Séries éducatives disponibles dans ce pays
            </CardDescription>
          </CardHeader>
          <CardContent>
            {country.series && country.series.length > 0 ? (
              <div className="space-y-3">
                {country.series.slice(0, 5).map((series: any) => (
                  <div key={series.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium">{series.name}</h4>
                      {series.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {series.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {series.profiles?.[0]?.count || 0} étudiants
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(series.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/admin/series/${series.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                {country.series.length > 5 && (
                  <div className="text-center pt-2">
                    <Button asChild variant="link" size="sm">
                      <Link href={`/dashboard/admin/series?country=${country.id}`}>
                        Voir {country.series.length - 5} autres séries
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune série trouvée</p>
                <Button asChild variant="link" size="sm" className="mt-2">
                  <Link href="/dashboard/admin/series/create">
                    Créer une série
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Utilisateurs ({totalUsers || 0})
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin/users" className="flex items-center gap-1">
                  Voir tous
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Utilisateurs enregistrés dans ce pays
            </CardDescription>
          </CardHeader>
          <CardContent>
            {country.profiles && country.profiles.length > 0 ? (
              <div className="space-y-3">
                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {totalAdmins || 0} Admin{(totalAdmins || 0) !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {totalMembers || 0} Collaborateur{(totalMembers || 0) !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {totalStudents || 0} Étudiant{(totalStudents || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {country.profiles.slice(0, 5).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium">{user.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          user.role === 'admin' ? 'default' : 
                          user.role === 'member' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {user.role === 'admin' ? 'Admin' : 
                           user.role === 'member' ? 'Collaborateur' : 'Étudiant'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {country.profiles.length > 5 && (
                  <div className="text-center pt-2">
                    <Button asChild variant="link" size="sm">
                      <Link href="/dashboard/admin/users">
                        Voir {country.profiles.length - 5} autres utilisateurs
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun utilisateur trouvé</p>
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
            Gérer les éléments liés à ce pays
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
              <Link href="/dashboard/admin/subjects">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Gérer les matières</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/dashboard/admin/users">
                <Users className="h-5 w-5" />
                <span className="text-sm">Gérer les utilisateurs</span>
              </Link>
            </Button>
            <CountryModal
              mode="edit"
              initialData={country}
              trigger={
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Edit className="h-5 w-5" />
                  <span className="text-sm">Modifier le pays</span>
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
