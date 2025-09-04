"use client"

import { useState, useEffect } from "react"
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Save,
  Flag,
  ArrowRight,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Question {
  id: string
  subject: string
  question: string
  type: "multiple_choice" | "open_ended"
  options?: string[]
  points: number
  difficulty: "easy" | "medium" | "hard"
}

interface ExamSimulationProps {
  title: string
  duration: number // in minutes
  questions: Question[]
  onSubmit?: (answers: Record<string, string>) => void
  onSave?: (answers: Record<string, string>) => void
}

const mockQuestions: Question[] = [
  {
    id: "1",
    subject: "Mathématiques",
    question: "Résoudre l'équation: 2x + 5 = 13",
    type: "multiple_choice",
    options: ["x = 4", "x = 9", "x = 3", "x = 6"],
    points: 2,
    difficulty: "easy"
  },
  {
    id: "2", 
    subject: "Physique",
    question: "Quelle est la formule de l'énergie cinétique ?",
    type: "multiple_choice",
    options: ["E = mc²", "E = ½mv²", "E = mgh", "E = Pt"],
    points: 2,
    difficulty: "medium"
  },
  {
    id: "3",
    subject: "Français",
    question: "Analysez le thème principal du roman 'L'Étranger' d'Albert Camus en 200 mots minimum.",
    type: "open_ended",
    points: 5,
    difficulty: "hard"
  }
]

export function ExamSimulation({ 
  title, 
  duration, 
  questions = mockQuestions,
  onSubmit,
  onSave 
}: ExamSimulationProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(duration * 60) // Convert to seconds
  const [isStarted, setIsStarted] = useState(false)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Timer effect
  useEffect(() => {
    if (!isStarted || isSubmitted) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsSubmitted(true)
          onSubmit?.(answers)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isStarted, isSubmitted, answers, onSubmit])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleSave = () => {
    onSave?.(answers)
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    onSubmit?.(answers)
  }

  const getQuestionStatus = (index: number) => {
    const question = questions[index]
    const hasAnswer = answers[question.id]
    const isFlagged = flaggedQuestions.has(question.id)
    
    if (hasAnswer) return "answered"
    if (isFlagged) return "flagged" 
    return "unanswered"
  }

  const answeredCount = questions.filter(q => answers[q.id]).length
  const progressPercentage = (answeredCount / questions.length) * 100

  // Pre-exam screen
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="text-muted-foreground">
              Simulation d'examen du baccalauréat
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/30">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold">Durée</div>
                <div className="text-muted-foreground">{duration} minutes</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold">Questions</div>
                <div className="text-muted-foreground">{questions.length} questions</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Instructions importantes
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Lisez attentivement chaque question avant de répondre</li>
                <li>• Vous pouvez marquer les questions pour y revenir plus tard</li>
                <li>• Votre progression est sauvegardée automatiquement</li>
                <li>• L'examen se termine automatiquement à la fin du temps imparti</li>
                <li>• Une fois soumis, vous ne pourrez plus modifier vos réponses</li>
              </ul>
            </div>

            <Button 
              onClick={() => setIsStarted(true)}
              size="lg" 
              className="w-full"
            >
              Commencer l'examen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <CardTitle className="text-2xl">Examen terminé !</CardTitle>
            <p className="text-muted-foreground">
              Votre copie a été soumise avec succès
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">{answeredCount}/{questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions répondues</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(((duration * 60 - timeLeft) / 60))}min
                </div>
                <div className="text-sm text-muted-foreground">Temps utilisé</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">
                  {questions.reduce((sum, q) => sum + q.points, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Points total</div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Vos résultats seront disponibles sous peu
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retour au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} sur {questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeLeft < 600 ? 'bg-destructive/10 text-destructive' : 'bg-muted'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono text-sm font-medium">
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Sauvegarder
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Soumettre
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Soumettre l'examen ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vous avez répondu à {answeredCount} questions sur {questions.length}.
                      Une fois soumis, vous ne pourrez plus modifier vos réponses.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continuer</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>
                      Soumettre définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {answeredCount} réponses sur {questions.length} questions
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Question Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{currentQ.subject}</Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      currentQ.difficulty === "easy" ? "success" :
                      currentQ.difficulty === "medium" ? "warning" : "destructive"
                    }>
                      {currentQ.points} points
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFlag(currentQ.id)}
                      className={flaggedQuestions.has(currentQ.id) ? "text-warning" : ""}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg leading-relaxed">
                  {currentQ.question}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {currentQ.type === "multiple_choice" && currentQ.options ? (
                  <RadioGroup
                    value={answers[currentQ.id] || ""}
                    onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                  >
                    {currentQ.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value={option} id={`${currentQ.id}-${index}`} />
                        <Label htmlFor={`${currentQ.id}-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea
                    placeholder="Tapez votre réponse ici..."
                    value={answers[currentQ.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    rows={8}
                    className="min-h-[200px]"
                  />
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              
              <Button
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                disabled={currentQuestion === questions.length - 1}
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="w-64">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index)
                    return (
                      <Button
                        key={index}
                        variant={index === currentQuestion ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentQuestion(index)}
                        className={`h-8 text-xs ${
                          status === "answered" ? "bg-success/20 border-success" :
                          status === "flagged" ? "bg-warning/20 border-warning" : ""
                        }`}
                      >
                        {index + 1}
                        {status === "flagged" && (
                          <Flag className="h-2 w-2 ml-1" />
                        )}
                      </Button>
                    )
                  })}
                </div>
                
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded"></div>
                    <span>Répondu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning rounded"></div>
                    <span>Marqué</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border rounded"></div>
                    <span>Non répondu</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
