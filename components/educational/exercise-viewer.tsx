'use client'

import { useState } from 'react'
import { FileText, Eye, EyeOff, ChevronLeft, ChevronRight, BookOpen, Clock, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QuizExerciseWithDetails, Question } from '@/types/database'

interface ExerciseViewerProps {
  exercise: QuizExerciseWithDetails
  onComplete?: () => void
}

export function ExerciseViewer({ exercise, onComplete }: ExerciseViewerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({})
  const [viewedQuestions, setViewedQuestions] = useState<Set<string>>(new Set())

  const questions = exercise.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index)
      // Mark question as viewed
      if (questions[index]) {
        setViewedQuestions(prev => new Set([...prev, questions[index].id]))
      }
    }
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      goToQuestion(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1)
    }
  }

  const toggleSolution = (questionId: string) => {
    setRevealedSolutions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const revealAllSolutions = () => {
    const newRevealed: Record<string, boolean> = {}
    questions.forEach(q => {
      newRevealed[q.id] = true
    })
    setRevealedSolutions(newRevealed)
  }

  const hideAllSolutions = () => {
    setRevealedSolutions({})
  }

  const progressPercentage = (viewedQuestions.size / totalQuestions) * 100
  const solutionsRevealedCount = Object.values(revealedSolutions).filter(Boolean).length

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucune question</h3>
        <p className="text-muted-foreground">
          Cet exercice ne contient pas encore de questions.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Exercise Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <FileText className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <CardTitle className="text-xl">{exercise.title}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Question {currentQuestionIndex + 1} sur {totalQuestions}
                </p>
                {exercise.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {exercise.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{exercise.estimated_duration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{viewedQuestions.size}/{totalQuestions}</span>
              </div>
            </div>
          </div>
          <Progress value={progressPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Instructions */}
      {exercise.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exercise.instructions }}
            />
          </CardContent>
        </Card>
      )}

      {/* Global Solution Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Solutions révélées: {solutionsRevealedCount}/{totalQuestions}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={revealAllSolutions}
                disabled={solutionsRevealedCount === totalQuestions}
              >
                <Eye className="h-4 w-4 mr-2" />
                Révéler tout
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={hideAllSolutions}
                disabled={solutionsRevealedCount === 0}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Masquer tout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              Exercice {currentQuestionIndex + 1}
              <Badge variant="outline" className="ml-2">
                {currentQuestion.points} {currentQuestion.points > 1 ? 'points' : 'point'}
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSolution(currentQuestion.id)}
            >
              {revealedSolutions[currentQuestion.id] ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Masquer la solution
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir la solution
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Text */}
          <div>
            <h4 className="font-medium text-base mb-3">Énoncé:</h4>
            <div 
              className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg"
              dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }}
            />
          </div>

          {/* Solution */}
          {revealedSolutions[currentQuestion.id] && currentQuestion.explanation && (
            <Alert className="border-green-200 bg-green-50">
              <Eye className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <h4 className="font-medium text-base mb-3">Solution:</h4>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }}
                />
              </AlertDescription>
            </Alert>
          )}

          {/* Hint to reveal solution */}
          {!revealedSolutions[currentQuestion.id] && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Essayez de résoudre cet exercice par vous-même avant de regarder la solution.
                Vous pouvez cliquer sur "Voir la solution" quand vous êtes prêt.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card>
        <CardContent className="flex justify-between items-center py-4">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          {/* Question indicators */}
          <div className="flex gap-2 overflow-x-auto max-w-md">
            {questions.map((question, index) => {
              const isViewed = viewedQuestions.has(question.id)
              const hasSolution = revealedSolutions[question.id]
              
              return (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 p-0 relative ${
                    isViewed ? 'ring-2 ring-blue-200' : ''
                  } ${
                    hasSolution ? 'bg-green-100 border-green-300' : ''
                  }`}
                >
                  {index + 1}
                  {hasSolution && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </Button>
              )
            })}
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button onClick={onComplete} variant="default">
              Terminer l'exercice
            </Button>
          ) : (
            <Button variant="outline" onClick={goToNextQuestion}>
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Exercise Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vue d'ensemble</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="progress">
            <TabsList>
              <TabsTrigger value="progress">Progression</TabsTrigger>
              <TabsTrigger value="summary">Résumé</TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{viewedQuestions.size}</div>
                  <div className="text-sm text-muted-foreground">Questions vues</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{solutionsRevealedCount}</div>
                  <div className="text-sm text-muted-foreground">Solutions révélées</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-2">
              <div className="text-sm">
                <div><strong>Matière:</strong> {exercise.subject?.name}</div>
                <div><strong>Série:</strong> {exercise.series?.name}</div>
                <div><strong>Niveau:</strong> {exercise.difficulty_level}/5</div>
                <div><strong>Durée estimée:</strong> {exercise.estimated_duration} minutes</div>
                <div><strong>Total des points:</strong> {questions.reduce((sum, q) => sum + q.points, 0)} points</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
