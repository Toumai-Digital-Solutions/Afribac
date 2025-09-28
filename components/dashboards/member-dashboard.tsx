'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  FileText, 
  Brain,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  BarChart3,
  UserCheck,
  Activity,
  Clock,
  Users,
  Star,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  PlusCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MemberDashboardProps {
  profile: any
}

interface MemberStats {
  content: {
    courses: number
    exams: number
    quizExercises: number
    published: number
    drafts: number
    totalViews: number
  }
  engagement: {
    totalStudents: number
    averageRating: number
    completionRate: number
    recentActivity: any[]
  }
  myContent: {
    recentCourses: any[]
    recentExams: any[]
    recentQuizExercises: any[]
    topPerforming: any[]
  }
  analytics: {
    weeklyViews: number[]
    popularSubjects: any[]
    monthlyStats: any
  }
}

export function MemberDashboard({ profile }: MemberDashboardProps) {
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemberStats()
  }, [profile.id])

  const fetchMemberStats = async () => {
    try {
      const supabase = createClient()

      // Fetch content statistics for this member
      const [
        { data: courses, count: coursesCount },
        { data: exams, count: examsCount },
        { data: quizExercises, count: quizExercisesCount },
        { data: publishedCourses, count: publishedCount },
        { data: draftCourses, count: draftCount }
      ] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact' }).eq('created_by', profile.id),
        supabase.from('exams').select('*', { count: 'exact' }).eq('created_by', profile.id),
        supabase.from('quiz_exercises').select('*', { count: 'exact' }).eq('created_by', profile.id),
        supabase.from('courses').select('*', { count: 'exact' }).eq('created_by', profile.id).eq('status', 'publish'),
        supabase.from('courses').select('*', { count: 'exact' }).eq('created_by', profile.id).eq('status', 'draft')
      ])

      // Fetch recent content
      const [
        { data: recentCourses },
        { data: recentExams },
        { data: recentQuizExercises }
      ] = await Promise.all([
        supabase.from('courses').select(`
          id, title, description, status, view_count, created_at, updated_at,
          subject:subjects(name, color, icon),
          topic:topics(id, name)
        `).eq('created_by', profile.id).order('updated_at', { ascending: false }).limit(5),
        supabase.from('exams').select(`
          id, title, description, status, view_count, created_at, updated_at,
          subject:subjects(name, color, icon)
        `).eq('created_by', profile.id).order('updated_at', { ascending: false }).limit(5),
        supabase.from('quiz_exercises').select(`
          id, title, description, content_type, status, view_count, created_at, updated_at,
          subject:subjects(name, color, icon)
        `).eq('created_by', profile.id).order('updated_at', { ascending: false }).limit(5)
      ])

      // Calculate total views
      const totalViews = [
        ...(courses || []),
        ...(exams || []),
        ...(quizExercises || [])
      ].reduce((sum, content) => sum + (content.view_count || 0), 0)

      // Fetch top performing content
      const { data: topPerforming } = await supabase
        .from('courses')
        .select(`
          id, title, view_count, status,
          subject:subjects(name, color),
          topic:topics(id, name)
        `)
        .eq('created_by', profile.id)
        .eq('status', 'publish')
        .order('view_count', { ascending: false })
        .limit(3)

      const memberStats: MemberStats = {
        content: {
          courses: coursesCount || 0,
          exams: examsCount || 0,
          quizExercises: quizExercisesCount || 0,
          published: publishedCount || 0,
          drafts: draftCount || 0,
          totalViews
        },
      engagement: {
        totalStudents: 0,
        averageRating: 0,
        completionRate: 0,
        recentActivity: []
      },
        myContent: {
          recentCourses: recentCourses || [],
          recentExams: recentExams || [],
          recentQuizExercises: recentQuizExercises || [],
          topPerforming: topPerforming || []
        },
      analytics: {
        weeklyViews: [],
        popularSubjects: [],
        monthlyStats: {
          views: totalViews,
          engagement: 0
        }
      }
      }

      setStats(memberStats)
    } catch (error) {
      console.error('Error fetching member stats:', error)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'publish':
        return <Badge className="bg-green-100 text-green-800 text-xs">Publié</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Brouillon</Badge>
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 text-xs">Archivé</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Espace collaborateur</h1>
            <p className="text-muted-foreground">Chargement de vos statistiques...</p>
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
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Espace collaborateur</h1>
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
          <div className="p-2 bg-orange-100 rounded-lg">
            <UserCheck className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Bienvenue, {profile.full_name} 👋
            </h1>
            <p className="text-muted-foreground">
              Espace collaborateur - {profile.country?.name || 'Région non définie'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/content/courses/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau cours
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenu créé</CardTitle>
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
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.content.totalViews.toLocaleString()}</div>
            <div className="flex gap-2 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>Vues cumulées</span>
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
            <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
              <CheckCircle className="h-3 w-3" />
              <span>Accessible aux étudiants</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.content.drafts}</div>
            <div className="flex items-center gap-1 text-xs text-yellow-600 mt-2">
              <AlertCircle className="h-3 w-3" />
              <span>En cours de création</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Actions rapides
          </CardTitle>
          <CardDescription>
            Créez du nouveau cours rapidement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/content/courses/new">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Nouveau cours</div>
                    <div className="text-xs text-muted-foreground">Créer du contenu pédagogique</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/content/exams/new">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Nouvel examen</div>
                    <div className="text-xs text-muted-foreground">Évaluation avec correction</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/content/quiz/new?type=quiz">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded">
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Nouveau quiz</div>
                    <div className="text-xs text-muted-foreground">Évaluation interactive</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/content/quiz/new?type=exercise">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded">
                    <FileText className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Nouvel exercice</div>
                    <div className="text-xs text-muted-foreground">Pratique avec solutions</div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Content Status */}
        <Card>
          <CardHeader>
            <CardTitle>État de vos contenus</CardTitle>
            <CardDescription>Répartition par statut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Publiés</span>
              </div>
              <span className="font-medium text-green-600">{stats.content.published}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Brouillons</span>
              </div>
              <span className="font-medium text-yellow-600">{stats.content.drafts}</span>
            </div>

            {(stats.content.published + stats.content.drafts) > 0 && (
              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground mb-2">Taux de publication</div>
                <Progress 
                  value={stats.content.published / (stats.content.published + stats.content.drafts) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(stats.content.published / (stats.content.published + stats.content.drafts) * 100)}% de votre contenu est publié
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <CardTitle>Contenu le plus populaire</CardTitle>
            <CardDescription>Vos créations les plus vues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.myContent.topPerforming.length === 0 ? (
                <div className="text-center py-4">
                  <Eye className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucun contenu publié pour le moment
                  </p>
                  <Link href="/dashboard/content/courses/new">
                    <Button variant="outline" size="sm" className="mt-2">
                      Créer du contenu
                    </Button>
                  </Link>
                </div>
              ) : (
                stats.myContent.topPerforming.map((content) => (
                  <div key={content.id} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: content.subject?.color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{content.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {content.view_count} vues
                      </p>
                    </div>
                    <Link href={`/dashboard/content/courses/${content.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Vos dernières modifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...stats.myContent.recentCourses, ...stats.myContent.recentExams, ...stats.myContent.recentQuizExercises]
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 5)
                .map((content) => (
                  <div key={content.id} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: content.subject?.color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{content.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Modifié le {formatDate(content.updated_at)}
                      </p>
                    </div>
                    {getStatusBadge(content.status)}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Cours ({stats.content.courses})</TabsTrigger>
          <TabsTrigger value="exams">Examens ({stats.content.exams})</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz & Exercices ({stats.content.quizExercises})</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mes cours</CardTitle>
                <CardDescription>Gestion de vos cours</CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/content/courses">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir tout
                  </Button>
                </Link>
                <Link href="/dashboard/content/courses/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.myContent.recentCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Aucun cours créé</h3>
                    <p className="text-muted-foreground mb-4">
                      Commencez par créer votre premier cours
                    </p>
                    <Link href="/dashboard/content/courses/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un cours
                      </Button>
                    </Link>
                  </div>
                ) : (
                  stats.myContent.recentCourses.map((course) => (
                    <div key={course.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: course.subject?.color || '#3B82F6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{course.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {course.description || 'Pas de description'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.view_count || 0} vues • Modifié le {formatDate(course.updated_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(course.status)}
                        <Link href={`/dashboard/content/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mes examens</CardTitle>
                <CardDescription>Gestion de vos examens</CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/content/exams">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir tout
                  </Button>
                </Link>
                <Link href="/dashboard/content/exams/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.myContent.recentExams.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Aucun examen créé</h3>
                    <p className="text-muted-foreground mb-4">
                      Créez des examens avec corrections pour vos étudiants
                    </p>
                    <Link href="/dashboard/content/exams/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un examen
                      </Button>
                    </Link>
                  </div>
                ) : (
                  stats.myContent.recentExams.map((exam) => (
                    <div key={exam.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: exam.subject?.color || '#3B82F6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{exam.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {exam.description || 'Pas de description'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exam.view_count || 0} vues • Modifié le {formatDate(exam.updated_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(exam.status)}
                        <Link href={`/dashboard/content/exams/${exam.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mes quiz & exercices</CardTitle>
                <CardDescription>Gestion de vos évaluations interactives</CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/content/quiz">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir tout
                  </Button>
                </Link>
                <Link href="/dashboard/content/quiz/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.myContent.recentQuizExercises.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Aucun quiz ou exercice</h3>
                    <p className="text-muted-foreground mb-4">
                      Créez des quiz interactifs et des exercices avec solutions
                    </p>
                    <div className="flex justify-center gap-2">
                      <Link href="/dashboard/content/quiz/new?type=quiz">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Créer un quiz
                        </Button>
                      </Link>
                      <Link href="/dashboard/content/quiz/new?type=exercise">
                        <Button variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Créer un exercice
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  stats.myContent.recentQuizExercises.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {item.content_type === 'quiz' ? (
                          <Brain className="h-4 w-4 text-purple-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-500" />
                        )}
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.subject?.color || '#3B82F6' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.description || 'Pas de description'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.view_count || 0} vues • Modifié le {formatDate(item.updated_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.content_type === 'quiz' ? 'default' : 'secondary'} className="text-xs">
                          {item.content_type === 'quiz' ? 'Quiz' : 'Exercice'}
                        </Badge>
                        {getStatusBadge(item.status)}
                        <Link href={`/dashboard/content/quiz/${item.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
