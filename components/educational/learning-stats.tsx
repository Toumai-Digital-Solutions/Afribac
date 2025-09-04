"use client"

import { 
  Clock, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Flame,
  Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AnalyticsChart, sampleData } from "@/components/charts/analytics-chart"

interface LearningStatsProps {
  timeSpent: number // hours
  coursesCompleted: number
  quizScore: number // percentage
  streak: number // days
  weeklyGoal: number // hours
  weeklyProgress: number // hours
  monthlyData?: Array<{ name: string; value: number }>
  subjectData?: Array<{ name: string; value: number }>
}

export function LearningStats({
  timeSpent,
  coursesCompleted,
  quizScore,
  streak,
  weeklyGoal,
  weeklyProgress,
  monthlyData = sampleData.monthlyProgress,
  subjectData = sampleData.subjectDistribution
}: LearningStatsProps) {
  const weeklyPercentage = (weeklyProgress / weeklyGoal) * 100
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }

  const getStreakEmoji = (days: number) => {
    if (days >= 30) return "🏆"
    if (days >= 14) return "🔥"
    if (days >= 7) return "⭐"
    if (days >= 3) return "💪"
    return "📚"
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps d'étude</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeSpent.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours terminés</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(quizScore)}`}>
              {quizScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              Quiz et exercices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Série d'étude</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{streak}</span>
              <span className="text-lg">{getStreakEmoji(streak)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              jours consécutifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objectif hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progression</span>
            <span className="text-sm font-medium">
              {weeklyProgress.toFixed(1)}h / {weeklyGoal}h
            </span>
          </div>
          <Progress value={weeklyPercentage} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>0h</span>
            <span className={weeklyPercentage >= 100 ? "text-success font-medium" : ""}>
              {weeklyPercentage >= 100 ? "Objectif atteint! 🎉" : `${Math.max(0, weeklyGoal - weeklyProgress).toFixed(1)}h restantes`}
            </span>
            <span>{weeklyGoal}h</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsChart
          title="Temps d'étude quotidien"
          description="Heures passées en étude cette semaine"
          data={sampleData.studyTime}
          type="area"
          height={250}
          showTrend
          trendValue={12.3}
          trendLabel="vs semaine dernière"
        />

        <AnalyticsChart
          title="Répartition par matière"
          description="Temps passé par matière (%)"
          data={subjectData}
          type="pie"
          height={250}
        />
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges et récompenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-success/5">
              <div className="text-2xl">🏆</div>
              <div>
                <h4 className="font-medium text-sm">Première victoire</h4>
                <p className="text-xs text-muted-foreground">Premier quiz réussi</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-warning/5">
              <div className="text-2xl">📚</div>
              <div>
                <h4 className="font-medium text-sm">Studieux</h4>
                <p className="text-xs text-muted-foreground">10h d'étude/semaine</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-primary/5">
              <div className="text-2xl">⭐</div>
              <div>
                <h4 className="font-medium text-sm">Perfectionniste</h4>
                <p className="text-xs text-muted-foreground">Score parfait</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 opacity-60">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-medium text-sm">Expert</h4>
                <p className="text-xs text-muted-foreground">20 cours terminés</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Streaks Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique d'étude (30 derniers jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 30 }, (_, i) => {
              const hasStudied = Math.random() > 0.3 // Mock data
              const intensity = hasStudied ? Math.floor(Math.random() * 4) + 1 : 0
              
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${
                    intensity === 0 ? 'bg-muted/30' :
                    intensity === 1 ? 'bg-success/20' :
                    intensity === 2 ? 'bg-success/40' :
                    intensity === 3 ? 'bg-success/60' :
                    'bg-success/80'
                  }`}
                  title={`Jour ${30 - i}: ${hasStudied ? `${intensity}h d'étude` : 'Pas d\'étude'}`}
                />
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Il y a 30 jours</span>
            <div className="flex items-center gap-2">
              <span>Moins</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${
                      level === 0 ? 'bg-muted/30' :
                      level === 1 ? 'bg-success/20' :
                      level === 2 ? 'bg-success/40' :
                      level === 3 ? 'bg-success/60' :
                      'bg-success/80'
                    }`}
                  />
                ))}
              </div>
              <span>Plus</span>
            </div>
            <span>Aujourd'hui</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
