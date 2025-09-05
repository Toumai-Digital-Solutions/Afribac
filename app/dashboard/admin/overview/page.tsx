import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Users, BookOpen, FileText, Plus, Settings } from 'lucide-react'
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
    { count: totalSubjects }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('countries').select('*', { count: 'exact', head: true }),
    supabase.from('series').select('*', { count: 'exact', head: true }),
    supabase.from('subjects').select('*', { count: 'exact', head: true })
  ])

  const adminCards = [
    {
      title: 'Gestion des pays',
      description: 'Gérer les pays et leurs paramètres',
      href: '/dashboard/admin/countries',
      icon: Globe,
      count: totalCountries || 0,
      color: 'text-blue-600'
    },
    {
      title: 'Gestion des séries',
      description: 'Gérer les séries par pays',
      href: '/dashboard/admin/series',
      icon: FileText,
      count: totalSeries || 0,
      color: 'text-green-600'
    },
    {
      title: 'Gestion des matières',
      description: 'Gérer les matières et coefficients',
      href: '/dashboard/admin/subjects',
      icon: BookOpen,
      count: totalSubjects || 0,
      color: 'text-purple-600'
    },
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérer tous les utilisateurs',
      href: '/dashboard/admin/users',
      icon: Users,
      count: totalUsers || 0,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            Administration globale
          </h1>
          <p className="text-muted-foreground">
            Gestion complète du système Afribac
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Super Admin
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
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
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pays</p>
                <p className="text-2xl font-bold">{totalCountries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Matières</p>
                <p className="text-2xl font-bold">{totalSubjects || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${card.color}`} />
                    {card.title}
                  </div>
                  <Badge variant="outline">{card.count}</Badge>
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={card.href}>
                      <Settings className="mr-2 h-4 w-4" />
                      Gérer
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`${card.href}/create`}>
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
