'use client'

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, Users, BookOpen, Settings, Plus, BarChart3, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { UserStatusBadge } from '@/components/ui/status-badge'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminDashboard() {
  const { user, profile, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/signin')
    } else if (!loading && user && !isAdmin && profile) {
      // Redirect non-admins to their appropriate dashboard
      if (profile.role === 'member') {
        router.replace('/member/dashboard')
      } else if (profile.role === 'user') {
        router.replace('/student/dashboard')
      }
    }
  }, [user, profile, loading, isAdmin, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Admin Dashboard - {profile.full_name || 'Administrator'} ⚡
          </h1>
          <p className="text-muted-foreground">
            Gestion globale de la plateforme Afribac
          </p>
        </div>
        <UserStatusBadge status={profile.status} />
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pays actifs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">SN, CI, ML, BF, NE</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">total inscrits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours publiés</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">tous pays confondus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membres actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">collaborateurs</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des contenus</CardTitle>
            <CardDescription>
              Administration globale des cours et matériaux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/courses/create">
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Créer un cours global
              </Button>
            </Link>
            <Link href="/admin/courses">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Tous les cours
              </Button>
            </Link>
            <Link href="/admin/content/moderate">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Modérer les contenus
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <CardDescription>
              Administration des comptes et rôles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Gérer les utilisateurs
              </Button>
            </Link>
            <Link href="/admin/members">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Gérer les membres
              </Button>
            </Link>
            <Link href="/admin/countries">
              <Button variant="outline" className="w-full justify-start">
                <Globe className="mr-2 h-4 w-4" />
                Gérer les pays
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics globales</CardTitle>
            <CardDescription>
              Suivi des performances par pays
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Vue d'ensemble
              </Button>
            </Link>
            <Link href="/admin/analytics/countries">
              <Button variant="outline" className="w-full justify-start">
                <Globe className="mr-2 h-4 w-4" />
                Comparaison par pays
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres système
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Admin Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>🌍 Capacités d'administration globale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Gestion des contenus</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ Créer des cours pour tous les pays</li>
                <li>✅ Modérer les contenus des membres</li>
                <li>✅ Gérer les tags et catégories</li>
                <li>✅ Approuver/rejeter les publications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Administration système</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ Ajouter/modifier des pays et séries</li>
                <li>✅ Attribuer des rôles aux utilisateurs</li>
                <li>✅ Gérer les membres par pays</li>
                <li>✅ Accès aux analytics globales</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
