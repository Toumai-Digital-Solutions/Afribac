'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Loader2, AlertCircle, Target, Clock, GraduationCap, TrendingUp, BookOpen, Lightbulb, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StudyGoal } from '@/types/database'

interface GoalsFormProps {
  userId: string
  initialStudyGoal?: StudyGoal | null
  initialWeeklyHours?: number | null
}

const STUDY_GOALS: { value: StudyGoal; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'baccalaureat',
    label: 'Préparer le Baccalauréat',
    description: 'Je me prépare pour réussir mon examen',
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    value: 'improve_grades',
    label: 'Améliorer mes notes',
    description: 'Je veux de meilleurs résultats scolaires',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    value: 'catch_up',
    label: 'Rattraper mon retard',
    description: 'J\'ai besoin de combler des lacunes',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    value: 'deepen_knowledge',
    label: 'Approfondir mes connaissances',
    description: 'Je veux aller plus loin dans les matières',
    icon: <Lightbulb className="h-5 w-5" />,
  },
  {
    value: 'other',
    label: 'Autre objectif',
    description: 'Mon objectif est différent',
    icon: <MoreHorizontal className="h-5 w-5" />,
  },
]

function getHoursLabel(hours: number): string {
  if (hours <= 3) return 'Léger (1-3h)'
  if (hours <= 7) return 'Modéré (4-7h)'
  if (hours <= 14) return 'Régulier (8-14h)'
  if (hours <= 21) return 'Intensif (15-21h)'
  return 'Très intensif (22h+)'
}

export function GoalsForm({ userId, initialStudyGoal, initialWeeklyHours }: GoalsFormProps) {
  const supabase = createClient()
  const [studyGoal, setStudyGoal] = useState<StudyGoal | null>(initialStudyGoal || null)
  const [weeklyHours, setWeeklyHours] = useState(initialWeeklyHours || 5)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onSave = async () => {
    if (!studyGoal) {
      setError('Veuillez sélectionner un objectif')
      return
    }

    setSaving(true)
    setError('')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          study_goal: studyGoal,
          weekly_availability_hours: weeklyHours,
        })
        .eq('id', userId)

      if (error) throw error

      window.location.href = '/dashboard'
    } catch (e: any) {
      setError(e?.message || 'Échec de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Study Goal Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Quel est votre objectif principal ?
        </Label>
        <div className="grid gap-2">
          {STUDY_GOALS.map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => setStudyGoal(goal.value)}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                'hover:border-primary/50 hover:bg-muted/50',
                studyGoal === goal.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg',
                  studyGoal === goal.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {goal.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{goal.label}</div>
                <div className="text-sm text-muted-foreground">{goal.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Availability */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Combien d'heures par semaine pouvez-vous étudier ?
        </Label>
        <div className="space-y-4 px-1">
          <Slider
            value={[weeklyHours]}
            onValueChange={([value]) => setWeeklyHours(value)}
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-primary">{weeklyHours}h</span>
            <span className="text-sm text-muted-foreground">{getHoursLabel(weeklyHours)}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={onSave}
        className="w-full h-12 rounded-2xl"
        disabled={!studyGoal || saving}
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sauvegarde…
          </>
        ) : (
          'Commencer'
        )}
      </Button>

      {error && (
        <Alert className="border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
