'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  TrendingUp,
  Clock,
  GraduationCap,
  Star,
  Play,
  CheckCircle,
  Target
} from 'lucide-react'

interface StudentDashboardProps {
  profile: any
}

export function StudentDashboard({ profile }: StudentDashboardProps) {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Bienvenue, {profile.full_name} 👋
            </h1>
            <p className="text-muted-foreground">
              Espace étudiant - {profile.series?.name || 'Apprentissage général'}
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Message */}
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 rounded-full p-6">
              <GraduationCap className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Tableau de bord étudiant</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Votre espace d'apprentissage personnalisé arrive bientôt ! 
            Vous pourrez y suivre vos progrès, accéder à vos cours et gérer votre apprentissage.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/courses">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Parcourir les cours
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline">
                Paramètres du profil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours suivis</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">À venir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">En développement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps d'étude</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réalisations</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Bientôt disponible</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}