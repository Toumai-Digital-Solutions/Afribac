"use client"

import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Target
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface MemberDashboardProps {
  memberName: string
  country: string
  countryCode: string
}

// Mock data - in real app this would come from API
const localStats = {
  activeStudents: 1247,
  coursesManaged: 67,
  quizzesCreated: 89,
  averageEngagement: 78.5
}

const recentStudents = [
  {
    id: "1",
    name: "Aminata Diallo",
    series: "S2",
    lastActive: "Il y a 2h",
    progress: 85,
    status: "active"
  },
  {
    id: "2", 
    name: "Ousmane Traoré",
    series: "S1",
    lastActive: "Il y a 5h",
    progress: 72,
    status: "struggling"
  },
  {
    id: "3",
    name: "Fatoumata Kane",
    series: "L",
    lastActive: "Il y a 1 jour",
    progress: 91,
    status: "excellent"
  }
]

const contentStats = [
  { subject: "Mathématiques", courses: 23, quizzes: 31, engagement: 82 },
  { subject: "Physique", courses: 18, quizzes: 25, engagement: 76 },
  { subject: "Chimie", courses: 15, quizzes: 18, engagement: 71 },
  { subject: "Français", courses: 11, quizzes: 15, engagement: 88 }
]

const recentActivities = [
  {
    id: "1",
    type: "course_created",
    title: "Nouveau cours: Trigonométrie avancée",
    subject: "Mathématiques",
    timestamp: "Il y a 2h"
  },
  {
    id: "2",
    type: "quiz_completed",
    title: "Quiz 'Analyse' complété par 15 étudiants",
    subject: "Mathématiques", 
    timestamp: "Il y a 4h"
  },
  {
    id: "3",
    type: "student_achievement",
    title: "Aminata D. a obtenu le badge 'Excellence'",
    subject: "Général",
    timestamp: "Il y a 6h"
  }
]

const pendingTasks = [
  {
    id: "1",
    title: "Révision du cours 'Intégrales'",
    type: "review",
    priority: "high",
    dueDate: "Dans 2 jours"
  },
  {
    id: "2",
    title: "Créer quiz pour chapitre 'Optique'",
    type: "create",
    priority: "medium", 
    dueDate: "Dans 5 jours"
  },
  {
    id: "3",
    title: "Analyser les performances série S1",
    type: "analyze",
    priority: "low",
    dueDate: "Dans 1 semaine"
  }
]

export function MemberDashboard({ memberName, country, countryCode }: MemberDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-success bg-success/10"
      case "struggling": return "text-warning bg-warning/10"
      default: return "text-muted-foreground bg-muted/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive bg-destructive/10"
      case "medium": return "text-warning bg-warning/10"
      default: return "text-muted-foreground bg-muted/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Tableau de bord • {country} 🇸🇳
          </h1>
          <p className="text-muted-foreground">
            Bonjour {memberName}, voici l'activité de vos étudiants aujourd'hui
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Créer du contenu
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localStats.activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              +8% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours gérés</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localStats.coursesManaged}</div>
            <p className="text-xs text-muted-foreground">
              Toutes matières confondues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz créés</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localStats.quizzesCreated}</div>
            <p className="text-xs text-muted-foreground">
              Ce trimestre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localStats.averageEngagement}%</div>
            <Progress value={localStats.averageEngagement} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Content Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance du contenu par matière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matière</TableHead>
                    <TableHead>Cours</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentStats.map(stat => (
                    <TableRow key={stat.subject}>
                      <TableCell className="font-medium">{stat.subject}</TableCell>
                      <TableCell>{stat.courses}</TableCell>
                      <TableCell>{stat.quizzes}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={stat.engagement} className="w-16" />
                          <span className="text-sm">{stat.engagement}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Student Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Activité récente des étudiants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            Série {student.series}
                          </Badge>
                          <span>{student.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(student.status)} border-0`}>
                        {student.progress}% complété
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Voir tous les étudiants
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Tâches en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div key={task.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${getPriorityColor(task.priority)} text-xs border-0`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {task.dueDate}
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full">
                  Voir toutes les tâches
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm leading-tight">{activity.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.subject}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Créer un cours
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Nouveau quiz
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyser les performances
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Gérer les étudiants
              </Button>
            </CardContent>
          </Card>

          {/* Country Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informations pays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pays:</span>
                  <span className="font-medium">{country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-medium">{countryCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Étudiants actifs:</span>
                  <span className="font-medium">{localStats.activeStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taux de réussite:</span>
                  <span className="font-medium text-success">84%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
