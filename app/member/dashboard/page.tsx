'use client'

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { getCollaborationStats } from '@/lib/collaboration'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, FileEdit, BarChart3, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { UserStatusBadge } from '@/components/ui/status-badge'
import { useRouter } from 'next/navigation'

export default function MemberDashboard() {
  const { user, profile, loading, isMember } = useAuth()
  const router = useRouter()
  const [collaborationStats, setCollaborationStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/signin')
    } else if (!loading && user && !isMember && profile) {
      // Redirect non-members to their appropriate dashboard
      if (profile.role === 'admin') {
        router.replace('/admin/dashboard')
      } else if (profile.role === 'user') {
        router.replace('/student/dashboard')
      }
    }
  }, [user, profile, loading, isMember, router])

  useEffect(() => {
    const loadStats = async () => {
      if (profile && isMember) {
        const stats = await getCollaborationStats()
        setCollaborationStats(stats)
        setStatsLoading(false)
      }
    }
    loadStats()
  }, [profile, isMember])

  if (loading || statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || !isMember) {
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
            Dashboard - {profile.full_name || 'Collaborateur'} 📊
          </h1>
          <p className="text-muted-foreground">
            Gestion des contenus pour {profile.country?.name}
          </p>
        </div>
        <UserStatusBadge status={profile.status} />
      </div>

      {/* Collaboration Stats */}
      {collaborationStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mes cours</CardTitle>
              <FileEdit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collaborationStats.myCreatedCourses}</div>
              <p className="text-xs text-muted-foreground">cours créés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cours collaboratifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collaborationStats.collaboratorCourses}</div>
              <p className="text-xs text-muted-foreground">par d'autres membres</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collaborateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collaborationStats.totalCollaborators}</div>
              <p className="text-xs text-muted-foreground">dans votre pays</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de collaboration</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(collaborationStats.collaborationRate)}%</div>
              <p className="text-xs text-muted-foreground">cours partagés</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des contenus</CardTitle>
            <CardDescription>
              Créez et gérez les cours pour les étudiants de {profile.country?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/member/courses/create">
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Créer un nouveau cours
              </Button>
            </Link>
            <Link href="/member/courses">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Gérer les cours existants
              </Button>
            </Link>
            <Link href="/member/quiz">
              <Button variant="outline" className="w-full justify-start">
                <FileEdit className="mr-2 h-4 w-4" />
                Créer des quiz
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Student Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des étudiants</CardTitle>
            <CardDescription>
              Suivez les progrès des étudiants de {profile.country?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/member/students">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Voir les étudiants
              </Button>
            </Link>
            <Link href="/member/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics locales
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Member Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>👥 Collaboration avec d'autres membres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              ✅ <strong>Vous pouvez éditer</strong> tous les cours créés pour {profile.country?.name}
            </p>
            <p>
              ✅ <strong>Collaboration en temps réel</strong> avec {collaborationStats?.totalCollaborators || 0} autres membres
            </p>
            <p>
              ✅ <strong>Gestion partagée</strong> des fichiers PDF et vidéos
            </p>
            <p>
              ❌ <strong>Accès limité</strong> aux contenus des autres pays
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
