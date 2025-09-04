"use client"

import { Clock, Users, Star, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface CourseCardProps {
  title: string
  subject: string
  description: string
  duration: string
  studentsCount: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  progress?: number
  rating?: number
  isCompleted?: boolean
  onClick?: () => void
}

export function CourseCard({
  title,
  subject,
  description,
  duration,
  studentsCount,
  difficulty,
  progress = 0,
  rating = 4.5,
  isCompleted = false,
  onClick
}: CourseCardProps) {
  const difficultyColors = {
    Beginner: "bg-success text-success-foreground",
    Intermediate: "bg-warning text-warning-foreground", 
    Advanced: "bg-destructive text-destructive-foreground"
  }

  return (
    <div className="course-card group cursor-pointer" onClick={onClick}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs">
              {subject}
            </Badge>
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          <Badge className={`${difficultyColors[difficulty]} text-xs`}>
            {difficulty}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Progress (if started) */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {duration}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {studentsCount.toLocaleString()}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>

        {/* Action */}
        <div className="pt-2">
          <Button 
            className="w-full" 
            variant={isCompleted ? "secondary" : "default"}
            size="sm"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {isCompleted ? "Revoir le cours" : progress > 0 ? "Continuer" : "Commencer"}
          </Button>
        </div>
      </div>
    </div>
  )
}
