"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface QuizQuestionProps {
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  timeLimit?: number
  questionNumber: number
  totalQuestions: number
  onAnswer?: (selectedOption: number, isCorrect: boolean) => void
}

export function QuizQuestion({
  question,
  options,
  correctAnswer,
  explanation,
  timeLimit = 60,
  questionNumber,
  totalQuestions,
  onAnswer
}: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeLimit)

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return
    
    setSelectedOption(optionIndex)
    setIsAnswered(true)
    
    const isCorrect = optionIndex === correctAnswer
    onAnswer?.(optionIndex, isCorrect)
  }

  const getOptionClassName = (optionIndex: number) => {
    let className = "quiz-option text-left"
    
    if (!isAnswered) {
      return className
    }
    
    if (optionIndex === correctAnswer) {
      className += " correct"
    } else if (optionIndex === selectedOption && optionIndex !== correctAnswer) {
      className += " incorrect"
    }
    
    if (optionIndex === selectedOption) {
      className += " selected"
    }
    
    return className
  }

  const progressPercentage = ((timeLimit - timeLeft) / timeLimit) * 100

  return (
    <div className="space-y-6 p-6 bg-card rounded-xl border">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Question {questionNumber} sur {totalQuestions}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
        
        <Progress value={(questionNumber / totalQuestions) * 100} className="h-2" />
      </div>

      {/* Question */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold leading-relaxed">
          {question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(index)}
            className={getOptionClassName(index)}
            disabled={isAnswered}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-background text-sm font-medium">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="flex-1">{option}</span>
              {isAnswered && index === correctAnswer && (
                <CheckCircle className="h-5 w-5 text-success" />
              )}
              {isAnswered && index === selectedOption && index !== correctAnswer && (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {isAnswered && explanation && (
        <div className="rounded-lg bg-accent/50 p-4 border-l-4 border-primary">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Explication
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

      {/* Actions */}
      {isAnswered && (
        <div className="pt-4 border-t">
          <Button className="w-full">
            Question suivante
          </Button>
        </div>
      )}
    </div>
  )
}
