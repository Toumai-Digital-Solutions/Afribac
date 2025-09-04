"use client"

import { TrendingUp, Award, Clock, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface SubjectProgress {
  name: string
  progress: number
  timeSpent: number // in hours
  coursesCompleted: number
  totalCourses: number
}

interface ProgressDashboardProps {
  subjects: SubjectProgress[]
  overallProgress: number
  totalTimeSpent: number
  achievementsUnlocked: number
  weeklyGoal: number
  weeklyProgress: number
}

export function ProgressDashboard({
  subjects,
  overallProgress,
  totalTimeSpent,
  achievementsUnlocked,
  weeklyGoal,
  weeklyProgress
}: ProgressDashboardProps) {
  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`
    }
    return `${Math.round(hours * 10) / 10}h`
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression Générale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps d'Étude</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Récompenses</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievementsUnlocked}</div>
            <p className="text-xs text-muted-foreground">
              Badges débloqués
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objectif Hebdomadaire</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((weeklyProgress / weeklyGoal) * 100)}%</div>
            <Progress value={(weeklyProgress / weeklyGoal) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {weeklyProgress}/{weeklyGoal} heures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progression par Matière</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjects.map((subject, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`status-dot ${
                    subject.progress >= 100 ? 'completed' : 
                    subject.progress > 0 ? 'in-progress' : 'not-started'
                  }`} />
                  <span className="font-medium">{subject.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{subject.coursesCompleted}/{subject.totalCourses} cours</span>
                  <Badge variant="outline" className="text-xs">
                    {formatTime(subject.timeSpent)}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{Math.round(subject.progress)}%</span>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="status-dot completed" />
              <div className="flex-1">
                <p className="text-sm font-medium">Quiz de Mathématiques complété</p>
                <p className="text-xs text-muted-foreground">Score: 18/20 • Il y a 2 heures</p>
              </div>
              <Badge className="bg-success text-success-foreground">+10 XP</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="status-dot completed" />
              <div className="flex-1">
                <p className="text-sm font-medium">Cours de Physique terminé</p>
                <p className="text-xs text-muted-foreground">Chapitre: Mécanique • Hier</p>
              </div>
              <Badge className="bg-warning text-warning-foreground">+15 XP</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="status-dot in-progress" />
              <div className="flex-1">
                <p className="text-sm font-medium">Simulation d'examen en cours</p>
                <p className="text-xs text-muted-foreground">Baccalauréat Série S • 45min restantes</p>
              </div>
              <Badge variant="outline">En cours</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
