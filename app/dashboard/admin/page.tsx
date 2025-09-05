import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CountryModal } from '@/components/modals/country-modal'
import { SeriesModal } from '@/components/modals/series-modal'
import { SubjectModal } from '@/components/modals/subject-modal'
import { 
  Globe, 
  Users, 
  BookOpen, 
  FileText, 
  Plus, 
  Settings, 
  BarChart3,
  TrendingUp,
  Calendar,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // If no user, redirect to signin
  if (!user || error) {
    redirect('/auth/signin')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      country:countries(*),
      series:series(*)
    `)
    .eq('id', user.id)
    .single()

  // If no profile found or not admin, redirect
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get admin stats
  const [
    { count: totalUsers },
    { count: totalCountries },
    { count: totalSeries },
    { count: totalSubjects },
    { count: totalAdmins },
    { count: totalMembers },
    { count: totalStudents }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('countries').select('*', { count: 'exact', head: true }),
    supabase.from('series').select('*', { count: 'exact', head: true }),
    supabase.from('subjects').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user')
  ])

  // Get recent activity data
  const { data: recentCountries } = await supabase
    .from('countries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: recentSeries } = await supabase
    .from('series')
    .select('*, country:countries(*)')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Administration globale</h1>
              <p className="text-muted-foreground">
                Gestion complète du système Afribac
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Super Admin
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {totalUsers || 0} utilisateur{(totalUsers || 0) !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                <p className="text-3xl font-bold">{totalUsers || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total sur la plateforme
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pays</p>
                <p className="text-3xl font-bold">{totalCountries || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Régions configurées
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Séries</p>
                <p className="text-3xl font-bold">{totalSeries || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Filières éducatives
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Matières</p>
                <p className="text-3xl font-bold">{totalSubjects || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Disciplines disponibles
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Répartition des utilisateurs
          </CardTitle>
          <CardDescription>
            Distribution des rôles sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-red-100">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold">{totalAdmins || 0}</p>
              <p className="text-sm text-muted-foreground">Administrateur{(totalAdmins || 0) !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-orange-100">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold">{totalMembers || 0}</p>
              <p className="text-sm text-muted-foreground">Collaborateur{(totalMembers || 0) !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{totalStudents || 0}</p>
              <p className="text-sm text-muted-foreground">Étudiant{(totalStudents || 0) !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Countries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Pays récents
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin/countries" className="flex items-center gap-1">
                  Voir tous
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Derniers pays ajoutés au système
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCountries && recentCountries.length > 0 ? (
              <div className="space-y-3">
                {recentCountries.map((country) => (
                  <div key={country.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
                        <Globe className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{country.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {country.code}
                          </Badge>
                          <Calendar className="h-3 w-3 ml-1" />
                          {new Date(country.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/admin/countries/${country.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun pays trouvé</p>
                <CountryModal 
                  mode="create" 
                  trigger={<Button variant="link" size="sm" className="mt-2">Ajouter un pays</Button>}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Series */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Séries récentes
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin/series" className="flex items-center gap-1">
                  Voir toutes
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Dernières séries créées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSeries && recentSeries.length > 0 ? (
              <div className="space-y-3">
                {recentSeries.map((series) => (
                  <div key={series.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{series.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {series.country?.name}
                          </Badge>
                          <Calendar className="h-3 w-3" />
                          {new Date(series.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/admin/series/${series.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune série trouvée</p>
                <SeriesModal 
                  mode="create" 
                  trigger={<Button variant="link" size="sm" className="mt-2">Créer une série</Button>}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Actions rapides
          </CardTitle>
          <CardDescription>
            Accès rapide aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CountryModal
              mode="create"
              trigger={
                <Button variant="outline" className="h-auto p-6 flex-col gap-3 hover:bg-blue-50 hover:border-blue-200">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <span className="font-medium">Nouveau pays</span>
                    <p className="text-xs text-muted-foreground mt-1">Ajouter un pays</p>
                  </div>
                </Button>
              }
            />
            
            <SeriesModal
              mode="create"
              trigger={
                <Button variant="outline" className="h-auto p-6 flex-col gap-3 hover:bg-green-50 hover:border-green-200">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-center">
                    <span className="font-medium">Nouvelle série</span>
                    <p className="text-xs text-muted-foreground mt-1">Créer une série</p>
                  </div>
                </Button>
              }
            />

            <SubjectModal
              mode="create"
              trigger={
                <Button variant="outline" className="h-auto p-6 flex-col gap-3 hover:bg-purple-50 hover:border-purple-200">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <span className="font-medium">Nouvelle matière</span>
                    <p className="text-xs text-muted-foreground mt-1">Ajouter une matière</p>
                  </div>
                </Button>
              }
            />

            <Button asChild variant="outline" className="h-auto p-6 flex-col gap-3 hover:bg-orange-50 hover:border-orange-200">
              <Link href="/dashboard/admin/users">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-center">
                  <span className="font-medium">Utilisateurs</span>
                  <p className="text-xs text-muted-foreground mt-1">Gérer les comptes</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
