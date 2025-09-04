"use client"

import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  Award,
  Calendar,
  PlayCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CourseCard } from "@/components/educational/course-card"
import { ProgressDashboard } from "@/components/educational/progress-dashboard"

interface StudentDashboardProps {
  studentName: string
  country: string
  series: string
}

// Mock data - in real app this would come from API
const weeklyStats = {
  studyTime: 8.5, // hours
  coursesCompleted: 3,
  quizzesTaken: 12,
  averageScore: 78
}

const recentCourses = [
  {
    id: "1",
    title: "Calcul Intégral",
    subject: "Mathématiques",
    description: "Techniques d'intégration et applications pratiques.",
    duration: "45min",
    studentsCount: 892,
    difficulty: "Advanced" as const,
    progress: 85,
    rating: 4.7
  },
  {
    id: "2", 
    title: "Mécanique des Fluides",
    subject: "Physique",
    description: "Propriétés des liquides et des gaz en mouvement.",
    duration: "1h 20min",
    studentsCount: 456,
    difficulty: "Intermediate" as const,
    progress: 60,
    rating: 4.5
  }
]

const upcomingQuizzes = [
  {
    id: "1",
    title: "Quiz Analyse Mathématique",
    subject: "Mathématiques",
    dueDate: "Dans 2 jours",
    duration: "30min",
    questions: 15
  },
  {
    id: "2",
    title: "Contrôle Chimie Organique", 
    subject: "Chimie",
    dueDate: "Dans 5 jours",
    duration: "45min",
    questions: 20
  }
]

const achievements = [
  { id: "1", title: "Première victoire", description: "Premier quiz réussi", icon: "🏆", unlocked: true },
  { id: "2", title: "Studieux", description: "10h d'étude cette semaine", icon: "📚", unlocked: true },
  { id: "3", title: "Perfectionniste", description: "Score parfait à un quiz", icon: "⭐", unlocked: false },
  { id: "4", title: "Persévérant", description: "7 jours consécutifs d'étude", icon: "🔥", unlocked: true }
]

const subjectProgress = [
  { name: "Mathématiques", progress: 85, timeSpent: 12.5, coursesCompleted: 8, totalCourses: 10 },
  { name: "Physique", progress: 72, timeSpent: 9.2, coursesCompleted: 6, totalCourses: 8 },
  { name: "Chimie", progress: 58, timeSpent: 7.1, coursesCompleted: 4, totalCourses: 7 },
  { name: "Français", progress: 91, timeSpent: 15.3, coursesCompleted: 10, totalCourses: 11 }
]

export function StudentDashboard({ studentName, country, series }: StudentDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bonjour, {studentName} 👋
        </h1>
        <p className="text-muted-foreground">
          Série {series} • {country} • Voici votre progression d'aujourd'hui
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.studyTime}h</div>
            <p className="text-xs text-muted-foreground">
              +2.1h par rapport à la semaine dernière
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours terminés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.coursesCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz réalisés</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.quizzesTaken}</div>
            <p className="text-xs text-muted-foreground">
              Score moyen: {weeklyStats.averageScore}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76%</div>
            <Progress value={76} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Continuer l'apprentissage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {recentCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    title={course.title}
                    subject={course.subject}
                    description={course.description}
                    duration={course.duration}
                    studentsCount={course.studentsCount}
                    difficulty={course.difficulty}
                    progress={course.progress}
                    rating={course.rating}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Quiz à venir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingQuizzes.map(quiz => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <h4 className="font-medium">{quiz.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline">{quiz.subject}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {quiz.duration}
                        </span>
                        <span>{quiz.questions} questions</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-warning">{quiz.dueDate}</div>
                      <Button size="sm" className="mt-2">
                        Commencer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weekly Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Objectif hebdomadaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Temps d'étude</span>
                  <span className="font-medium">{weeklyStats.studyTime}/15h</span>
                </div>
                <Progress value={(weeklyStats.studyTime / 15) * 100} />
                <p className="text-xs text-muted-foreground">
                  Plus que {15 - weeklyStats.studyTime}h pour atteindre votre objectif !
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4" />
                Badges récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.slice(0, 3).map(achievement => (
                  <div key={achievement.id} className={`flex items-center gap-3 p-2 rounded-lg ${
                    achievement.unlocked ? 'bg-success/10' : 'bg-muted/30 opacity-60'
                  }`}>
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full">
                  Voir tous les badges
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Study Streak */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Série d'étude</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">7</div>
                <p className="text-sm text-muted-foreground">jours consécutifs</p>
                <div className="flex justify-center gap-1">
                  {[1,2,3,4,5,6,7].map(day => (
                    <div key={day} className="w-3 h-3 rounded-full bg-primary"></div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Continue comme ça ! 🔥
                </p>
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
                <BookOpen className="h-4 w-4 mr-2" />
                Parcourir les cours
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Quiz d'entraînement
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Planning de révision
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progression détaillée par matière</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressDashboard
            subjects={subjectProgress}
            overallProgress={76}
            totalTimeSpent={weeklyStats.studyTime}
            achievementsUnlocked={3}
            weeklyGoal={15}
            weeklyProgress={weeklyStats.studyTime}
          />
        </CardContent>
      </Card>
    </div>
  )
}
