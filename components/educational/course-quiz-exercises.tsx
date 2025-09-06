'use client'

import { useState, useEffect } from 'react'
import { Brain, FileText, Plus, Eye, Edit, Play, Clock, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { QuizExercise } from '@/types/database'
import Link from 'next/link'

interface CourseQuizExerciseData extends QuizExercise {
  question_count: number
  total_points: number
  subject_name: string
  subject_color: string
  subject_icon: string | null
}

interface CourseQuizExercisesProps {
  courseId: string
  canManage?: boolean
}

const difficultyLabels = ['', 'Très facile', 'Facile', 'Moyen', 'Difficile', 'Très difficile']

const statusConfig = {
  draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Brouillon' },
  published: { color: 'bg-green-100 text-green-800', label: 'Publié' },
  archived: { color: 'bg-gray-100 text-gray-800', label: 'Archivé' },
}

export function CourseQuizExercises({ courseId, canManage = false }: CourseQuizExercisesProps) {
  const [quizExercises, setQuizExercises] = useState<CourseQuizExerciseData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchQuizExercises()
  }, [courseId])

  const fetchQuizExercises = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('course_quiz_exercises')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuizExercises(data || [])
    } catch (error) {
      console.error('Error fetching quiz/exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const quizzes = quizExercises.filter(item => item.content_type === 'quiz')
  const exercises = quizExercises.filter(item => item.content_type === 'exercise')
  const publishedItems = quizExercises.filter(item => item.status === 'published')

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <span>Chargement des quiz et exercices...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderQuizExerciseCard = (item: CourseQuizExerciseData) => {
    const isQuiz = item.content_type === 'quiz'
    const Icon = isQuiz ? Brain : FileText
    const iconColor = isQuiz ? 'text-blue-500' : 'text-green-500'
    
    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={`mt-0.5 ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base truncate">{item.title}</CardTitle>
                {item.description && (
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={isQuiz ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {isQuiz ? 'Quiz' : 'Exercice'}
                  </Badge>
                  <Badge 
                    className={statusConfig[item.status as keyof typeof statusConfig].color} 
                    variant="secondary"
                  >
                    {statusConfig[item.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{item.question_count} question(s)</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              <span>{item.total_points} pt(s)</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{item.estimated_duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{item.view_count} vue(s)</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">Difficulté:</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < item.difficulty_level ? 'bg-orange-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {difficultyLabels[item.difficulty_level]}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            {item.status === 'published' && (
              <Link href={`/${isQuiz ? 'quiz' : 'exercise'}/${item.id}`} className="flex-1">
                <Button size="sm" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  {isQuiz ? 'Démarrer' : 'Voir'}
                </Button>
              </Link>
            )}
            
            {canManage && (
              <div className="flex gap-2">
                <Link href={`/dashboard/content/quiz/${item.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
                <Link href={`/dashboard/admin/quiz-exercises/${item.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Quiz & Exercices</h3>
          <p className="text-sm text-muted-foreground">
            Contenu interactif lié à ce cours
          </p>
        </div>
        
        {canManage && (
          <div className="flex gap-2">
            <Link href={`/dashboard/content/quiz/new?type=exercise&course_id=${courseId}`}>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Nouvel Exercice
              </Button>
            </Link>
            <Link href={`/dashboard/content/quiz/new?type=quiz&course_id=${courseId}`}>
              <Button size="sm">
                <Brain className="h-4 w-4 mr-2" />
                Nouveau Quiz
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quiz</p>
                <p className="text-2xl font-bold text-blue-600">{quizzes.length}</p>
              </div>
              <Brain className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exercices</p>
                <p className="text-2xl font-bold text-green-600">{exercises.length}</p>
              </div>
              <FileText className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publiés</p>
                <p className="text-2xl font-bold text-emerald-600">{publishedItems.length}</p>
              </div>
              <Eye className="h-6 w-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {quizExercises.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-muted rounded-full p-3">
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="font-semibold mb-2">Aucun quiz ou exercice</h3>
            <p className="text-muted-foreground mb-4">
              Ce cours n'a pas encore de quiz ou d'exercices associés.
            </p>
            {canManage && (
              <div className="flex justify-center gap-2">
                <Link href={`/dashboard/content/quiz/new?type=quiz&course_id=${courseId}`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un quiz
                  </Button>
                </Link>
                <Link href={`/dashboard/content/quiz/new?type=exercise&course_id=${courseId}`}>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un exercice
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Tous ({quizExercises.length})</TabsTrigger>
            <TabsTrigger value="quiz">Quiz ({quizzes.length})</TabsTrigger>
            <TabsTrigger value="exercise">Exercices ({exercises.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {quizExercises.map(renderQuizExerciseCard)}
            </div>
          </TabsContent>
          
          <TabsContent value="quiz" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {quizzes.map(renderQuizExerciseCard)}
            </div>
          </TabsContent>
          
          <TabsContent value="exercise" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {exercises.map(renderQuizExerciseCard)}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
