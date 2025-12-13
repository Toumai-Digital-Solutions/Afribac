'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Clock, CheckCircle, XCircle, RotateCcw, Eye, ChevronLeft, ChevronRight, Trophy, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { QuizExerciseWithDetails, Question, AnswerOption } from '@/types/database'

interface QuizPlayerProps {
  quiz: QuizExerciseWithDetails
  onComplete?: (score: number, maxScore: number, timeSpent: number) => void
}

interface UserAnswer {
  questionId: string
  selectedOptions: string[]
  textAnswer: string
  isAnswered: boolean
}

type QuizState = 'playing' | 'completed' | 'reviewing'

export function QuizPlayer({ quiz, onComplete }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({})
  const [quizState, setQuizState] = useState<QuizState>('playing')
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState<number>(Date.now())
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, boolean>>({})

  const questions = quiz.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  // Initialize user answers
  useEffect(() => {
    const initialAnswers: Record<string, UserAnswer> = {}
    questions.forEach(q => {
      initialAnswers[q.id] = {
        questionId: q.id,
        selectedOptions: [],
        textAnswer: '',
        isAnswered: false
      }
    })
    setUserAnswers(initialAnswers)
  }, [questions])

  // Timer effect
  useEffect(() => {
    if (quizState !== 'playing') return

    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [quizState, startTime])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const updateAnswer = useCallback((questionId: string, updates: Partial<UserAnswer>) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...updates }
    }))
  }, [])

  const handleSingleChoice = (questionId: string, optionId: string) => {
    updateAnswer(questionId, {
      selectedOptions: [optionId],
      isAnswered: true
    })
  }

  const handleMultipleChoice = (questionId: string, optionId: string, checked: boolean) => {
    const currentAnswer = userAnswers[questionId]
    const newSelectedOptions = checked
      ? [...currentAnswer.selectedOptions, optionId]
      : currentAnswer.selectedOptions.filter(id => id !== optionId)

    updateAnswer(questionId, {
      selectedOptions: newSelectedOptions,
      isAnswered: newSelectedOptions.length > 0
    })
  }

  const handleShortAnswer = (questionId: string, text: string) => {
    updateAnswer(questionId, {
      textAnswer: text,
      isAnswered: text.trim().length > 0
    })
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index)
    }
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScore = () => {
    let totalScore = 0
    let totalPossibleScore = 0
    const results: Record<string, boolean> = {}

    questions.forEach(question => {
      totalPossibleScore += question.points
      const userAnswer = userAnswers[question.id]
      
      if (!userAnswer.isAnswered) {
        results[question.id] = false
        return
      }

      let isCorrect = false

      if (question.question_type === 'short_answer') {
        // For short answer, we'll mark as correct for now (requires manual grading)
        isCorrect = true
      } else {
        const correctOptionIds = question.answer_options
          ?.filter(opt => opt.is_correct)
          .map(opt => opt.id) || []

        if (question.question_type === 'single_choice' || question.question_type === 'true_false') {
          isCorrect = userAnswer.selectedOptions.length === 1 && 
                     correctOptionIds.includes(userAnswer.selectedOptions[0])
        } else if (question.question_type === 'multiple_choice') {
          const userSelected = [...userAnswer.selectedOptions].sort()
          const correctSelected = [...correctOptionIds].sort()
          isCorrect = userSelected.length === correctSelected.length &&
                     userSelected.every(id => correctSelected.includes(id))
        }
      }

      if (isCorrect) {
        totalScore += question.points
      }
      results[question.id] = isCorrect
    })

    return { totalScore, totalPossibleScore, results }
  }

  const submitQuiz = async () => {
    const { totalScore, totalPossibleScore, results } = calculateScore()
    
    setScore(totalScore)
    setMaxScore(totalPossibleScore)
    setCorrectAnswers(results)
    setQuizState('completed')
    setShowResults(true)

    // Save to database
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Create quiz attempt
        const { data: attempt, error: attemptError } = await supabase
          .from('quiz_attempts')
          .insert({
            quiz_exercise_id: quiz.id,
            user_id: user.id,
            score: totalScore,
            max_score: totalPossibleScore,
            time_taken: timeSpent
          })
          .select()
          .single()

        if (attemptError) throw attemptError

        // Save user answers
        const answersToSave = questions.map(question => {
          const userAnswer = userAnswers[question.id]
          return {
            quiz_attempt_id: attempt.id,
            question_id: question.id,
            selected_options: userAnswer.selectedOptions.length > 0 ? userAnswer.selectedOptions : null,
            text_answer: userAnswer.textAnswer || null,
            is_correct: results[question.id]
          }
        }).filter(answer => answer.selected_options || answer.text_answer)

        if (answersToSave.length > 0) {
          const { error: answersError } = await supabase
            .from('user_answers')
            .insert(answersToSave)

          if (answersError) throw answersError
        }

        toast.success('Quiz terminé et sauvegardé!')
        onComplete?.(totalScore, totalPossibleScore, timeSpent)
      }
    } catch (error) {
      console.error('Error saving quiz results:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    const resetAnswers: Record<string, UserAnswer> = {}
    questions.forEach(q => {
      resetAnswers[q.id] = {
        questionId: q.id,
        selectedOptions: [],
        textAnswer: '',
        isAnswered: false
      }
    })
    setUserAnswers(resetAnswers)
    setQuizState('playing')
    setShowResults(false)
    setScore(0)
    setMaxScore(0)
    setTimeSpent(0)
  }

  const getAnsweredCount = () => {
    return Object.values(userAnswers).filter(answer => answer.isAnswered).length
  }

  const progressPercentage = (getAnsweredCount() / totalQuestions) * 100

  if (quizState === 'completed' && showResults) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="h-16 w-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">Quiz Terminé!</CardTitle>
            <div className="flex justify-center items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-muted-foreground">sur {maxScore} points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{Math.round((score / maxScore) * 100)}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{formatTime(timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Temps</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4">
              <Button onClick={restartQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Recommencer
              </Button>
              <Button onClick={() => setQuizState('reviewing')}>
                <Eye className="h-4 w-4 mr-2" />
                Revoir les réponses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p>Aucune question trouvée pour ce quiz.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <p className="text-muted-foreground mt-1">
                Question {currentQuestionIndex + 1} sur {totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeSpent)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{getAnsweredCount()}/{totalQuestions}</span>
              </div>
            </div>
          </div>
          <Progress value={progressPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1}
              <Badge variant="outline" className="ml-2">
                {currentQuestion.points} {currentQuestion.points > 1 ? 'points' : 'point'}
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Text */}
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }}
          />

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.question_type === 'single_choice' && (
              <RadioGroup
                value={userAnswers[currentQuestion.id]?.selectedOptions[0] || ''}
                onValueChange={(value) => handleSingleChoice(currentQuestion.id, value)}
              >
                {currentQuestion.answer_options?.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.question_type === 'multiple_choice' && (
              <div className="space-y-2">
                {currentQuestion.answer_options?.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={userAnswers[currentQuestion.id]?.selectedOptions.includes(option.id) || false}
                      onCheckedChange={(checked) => 
                        handleMultipleChoice(currentQuestion.id, option.id, !!checked)
                      }
                    />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.question_type === 'true_false' && (
              <RadioGroup
                value={userAnswers[currentQuestion.id]?.selectedOptions[0] || ''}
                onValueChange={(value) => handleSingleChoice(currentQuestion.id, value)}
              >
                {currentQuestion.answer_options?.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.question_type === 'short_answer' && (
              <div>
                <Label htmlFor="short-answer">Votre réponse</Label>
                <Textarea
                  id="short-answer"
                  value={userAnswers[currentQuestion.id]?.textAnswer || ''}
                  onChange={(e) => handleShortAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Tapez votre réponse ici..."
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Show answer status */}
          {quizState === 'reviewing' && (
            <Alert className={correctAnswers[currentQuestion.id] ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {correctAnswers[currentQuestion.id] ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {correctAnswers[currentQuestion.id] ? 'Correct!' : 'Incorrect'}
                  {currentQuestion.explanation && (
                    <>
                      <Separator className="my-2" />
                      <div 
                        className="prose prose-sm mt-2"
                        dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }}
                      />
                    </>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
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

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToQuestion(index)}
                className={`w-8 h-8 p-0 ${
                  userAnswers[questions[index].id]?.isAnswered ? 'bg-green-100 border-green-300' : ''
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button onClick={submitQuiz} disabled={getAnsweredCount() === 0}>
              Terminer le quiz
            </Button>
          ) : (
            <Button variant="outline" onClick={goToNextQuestion}>
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
