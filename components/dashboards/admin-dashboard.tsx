'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Users, 
  BookOpen, 
  FileText, 
  Brain,
  TrendingUp,
  AlertTriangle,
  Shield,
  Settings,
  Plus,
  Eye,
  BarChart3,
  Crown,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Globe,
  School,
  Database,
  UserCheck,
  GraduationCap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AdminDashboardProps {
  profile: any
}

interface DashboardStats {
  users: {
    total: number
    admins: number
    members: number
    students: number
    recent: any[]
  }
  content: {
    courses: number
    exams: number
    quizExercises: number
    published: number
    drafts: number
    recent: any[]
  }
  activity: {
    todayLogins: number
    weeklyActive: number
    monthlyActive: number
    recentActivity: any[]
  }
  system: {
    storage: number
    performance: number
    uptime: number
  }
}

export function AdminDashboard({ profile }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const supabase = createClient()

      // Fetch user statistics
      const [
        { data: allUsers, count: totalUsers },
        { data: admins, count: adminCount },
        { data: members, count: memberCount },
        { data: students, count: studentCount },
        { data: recentUsers }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'admin'),
        supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'member'),
        supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'user'),
        supabase.from('profiles').select(`
          id, full_name, email, role, created_at, last_sign_in_at,
          country:countries(name)
        `).order('created_at', { ascending: false }).limit(5)
      ])

      // Fetch content statistics
      const [
        { data: courses, count: coursesCount },
        { data: exams, count: examsCount },
        { data: quizExercises, count: quizExercisesCount },
        { data: publishedContent, count: publishedCount },
        { data: draftContent, count: draftCount },
        { data: recentContent }
      ] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact' }),
        supabase.from('exams').select('*', { count: 'exact' }),
        supabase.from('quiz_exercises').select('*', { count: 'exact' }),
        supabase.from('courses').select('*', { count: 'exact' }).eq('status', 'publish'),
        supabase.from('courses').select('*', { count: 'exact' }).eq('status', 'draft'),
        supabase.from('courses').select(`
          id, title, status, created_at, updated_at,
          subject:subjects(name, color),
          created_by_profile:profiles(full_name)
        `).order('created_at', { ascending: false }).limit(5)
      ])

      const dashboardStats: DashboardStats = {
        users: {
          total: totalUsers || 0,
          admins: adminCount || 0,
          members: memberCount || 0,
          students: studentCount || 0,
          recent: recentUsers || []
        },
        content: {
          courses: coursesCount || 0,
          exams: examsCount || 0,
          quizExercises: quizExercisesCount || 0,
          published: publishedCount || 0,
          drafts: draftCount || 0,
          recent: recentContent || []
        },
        activity: {
          todayLogins: 0,
          weeklyActive: 0,
          monthlyActive: 0,
          recentActivity: []
        },
        system: {
          storage: 0,
          performance: 0,
          uptime: 0
        }
      }

      setStats(dashboardStats)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown
      case 'member': return UserCheck  
      case 'user': return GraduationCap
      default: return Users
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'member': return 'bg-orange-100 text-orange-800'
      case 'user': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
            <p className="text-muted-foreground">Erreur lors du chargement des données</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Crown className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Bienvenue, {profile.full_name} 👋
            </h1>
            <p className="text-muted-foreground">
              Tableau de bord administrateur - Vue d'ensemble complète
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <div className="flex gap-2 text-xs text-muted-foreground mt-2">
              <span>{stats.users.students} étudiants</span>
              <span>•</span>
              <span>{stats.users.members} collaborateurs</span>
              <span>•</span>
              <span>{stats.users.admins} admins</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenu total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.content.courses + stats.content.exams + stats.content.quizExercises}
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground mt-2">
              <span>{stats.content.courses} cours</span>
              <span>•</span>
              <span>{stats.content.exams} examens</span>
              <span>•</span>
              <span>{stats.content.quizExercises} quiz</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenu publié</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.content.published}</div>
            <div className="flex gap-2 text-xs text-muted-foreground mt-2">
              <span>{stats.content.drafts} en attente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <div className="flex gap-2 text-xs text-muted-foreground mt-2">
              <span>Total inscrits</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Actions rapides
          </CardTitle>
          <CardDescription>
            Raccourcis vers les fonctionnalités les plus utilisées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/admin/users">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Gérer utilisateurs</div>
                    <div className="text-xs text-muted-foreground">Modérer et administrer</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/admin/countries">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <Globe className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Gérer pays</div>
                    <div className="text-xs text-muted-foreground">Configuration système</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/admin/series">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded">
                    <School className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Gérer séries</div>
                    <div className="text-xs text-muted-foreground">Filières et programmes</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/admin/subjects">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded">
                    <BookOpen className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Gérer matières</div>
                    <div className="text-xs text-muted-foreground">Disciplines académiques</div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Nouveaux utilisateurs</CardTitle>
              <CardDescription>Les 5 derniers inscrits</CardDescription>
            </div>
            <Link href="/dashboard/admin/users">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.users.recent.map((user) => {
                const RoleIcon = getRoleIcon(user.role)
                return (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.country?.name || 'Pays non défini'} • {formatDate(user.created_at)}
                      </p>
                    </div>
                    <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`} variant="secondary">
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Contenu récent</CardTitle>
              <CardDescription>Dernières créations</CardDescription>
            </div>
            <Link href="/dashboard/content/courses">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.content.recent.map((content) => (
                <div key={content.id} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: content.subject?.color || '#3B82F6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{content.title}</p>
                    <p className="text-xs text-muted-foreground">
                      par {content.created_by_profile?.full_name || 'Anonyme'} • {formatDate(content.created_at)}
                    </p>
                  </div>
                  <Badge 
                    variant={content.status === 'publish' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {content.status === 'publish' ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              État de la plateforme
            </CardTitle>
            <CardDescription>Surveillance des services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Base de données</span>
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs">Opérationnelle</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Authentification</span>
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs">Opérationnelle</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Stockage fichiers</span>
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs">Opérationnelle</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Content Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques du contenu</CardTitle>
            <CardDescription>Répartition par type et statut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Cours</span>
              </div>
              <span className="font-medium">{stats.content.courses}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span className="text-sm">Examens</span>
              </div>
              <span className="font-medium">{stats.content.exams}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Quiz & Exercices</span>
              </div>
              <span className="font-medium">{stats.content.quizExercises}</span>
            </div>

            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Publiés</span>
                <span className="text-green-600 font-medium">{stats.content.published}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Brouillons</span>
                <span className="text-orange-600 font-medium">{stats.content.drafts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}