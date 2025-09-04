'use client'

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Target, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { UserStatusBadge } from '@/components/ui/status-badge'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function StudentDashboard() {
  const { user, profile, loading, isStudent } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Student Dashboard - Loading:', loading, 'User:', !!user, 'Profile:', !!profile, 'isStudent:', isStudent)
    
    if (!loading && !user) {
      console.log('No user, redirecting to signin')
      router.replace('/auth/signin')
    } else if (!loading && user && !isStudent && profile) {
      console.log('User is not a student, role:', profile.role)
      // Redirect non-students to their appropriate dashboard
      if (profile.role === 'admin') {
        router.replace('/admin/dashboard')
      } else if (profile.role === 'member') {
        router.replace('/member/dashboard')
      }
    }
  }, [user, profile, loading, isStudent, router])

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

  if (!user || !profile) {
    console.log('No user or profile, should redirect to auth')
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
            Bonjour, {profile.full_name || 'Étudiant'}! 👋
          </h1>
          <p className="text-muted-foreground">
            {profile.country?.name} • {profile.series?.name} - {profile.series?.description}
          </p>
        </div>
        <UserStatusBadge status={profile.status} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours terminés</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">sur 0 disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps d'étude</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground">cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz réussis</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">moyenne: 0%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">du programme</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cours recommandés</CardTitle>
            <CardDescription>
              Continuez votre apprentissage avec ces cours adaptés à votre série
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun cours disponible pour le moment</p>
              <p className="text-sm mt-2">
                Les cours apparaîtront ici une fois que vos enseignants auront publié du contenu
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/student/courses">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Parcourir les cours
              </Button>
            </Link>
            <Link href="/student/quiz">
              <Button variant="outline" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                Faire un quiz
              </Button>
            </Link>
            <Link href="/student/progress">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Voir ma progression
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message for New Users */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Bienvenue sur Afribac! 🎓
            </h3>
            <p className="text-muted-foreground mb-4">
              Vous avez accès aux contenus éducatifs spécialement conçus pour les étudiants de {profile.country?.name}.
              Explorez les cours, testez vos connaissances avec des quiz, et suivez votre progression.
            </p>
            <Link href="/student/courses">
              <Button>
                Commencer l'apprentissage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
