'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  User,
  Camera,
  Phone,
  Calendar,
  Target,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile, StudyGoal } from '@/types/database'

interface ProfileCompletionCardProps {
  profile: Profile
  className?: string
  compact?: boolean
}

interface ChecklistItem {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  completed: boolean
  href?: string
  priority: 'required' | 'recommended' | 'optional'
}

function getStudyGoalLabel(goal: StudyGoal): string {
  const labels: Record<StudyGoal, string> = {
    baccalaureat: 'Préparer le Baccalauréat',
    improve_grades: 'Améliorer mes notes',
    catch_up: 'Rattraper mon retard',
    deepen_knowledge: 'Approfondir mes connaissances',
    other: 'Autre objectif',
  }
  return labels[goal] || goal
}

export function ProfileCompletionCard({ profile, className, compact = false }: ProfileCompletionCardProps) {
  const checklist: ChecklistItem[] = [
    {
      id: 'full_name',
      label: 'Nom complet',
      description: profile.full_name || 'Non renseigné',
      icon: <User className="h-4 w-4" />,
      completed: Boolean(profile.full_name),
      href: '/dashboard/profile',
      priority: 'required',
    },
    {
      id: 'avatar',
      label: 'Photo de profil',
      description: profile.avatar_url ? 'Ajoutée' : 'Personnalisez votre profil',
      icon: <Camera className="h-4 w-4" />,
      completed: Boolean(profile.avatar_url),
      href: '/dashboard/profile',
      priority: 'recommended',
    },
    {
      id: 'phone',
      label: 'Téléphone',
      description: profile.phone || 'Pour être contacté',
      icon: <Phone className="h-4 w-4" />,
      completed: Boolean(profile.phone),
      href: '/dashboard/profile',
      priority: 'optional',
    },
    {
      id: 'date_of_birth',
      label: 'Date de naissance',
      description: profile.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString('fr-FR')
        : 'Non renseignée',
      icon: <Calendar className="h-4 w-4" />,
      completed: Boolean(profile.date_of_birth),
      href: '/dashboard/profile',
      priority: 'optional',
    },
  ]

  // Only add study goals for students
  if (profile.role === 'user') {
    checklist.push(
      {
        id: 'study_goal',
        label: 'Objectif d\'études',
        description: profile.study_goal
          ? getStudyGoalLabel(profile.study_goal)
          : 'Définissez votre objectif',
        icon: <Target className="h-4 w-4" />,
        completed: Boolean(profile.study_goal),
        href: '/dashboard/profile',
        priority: 'recommended',
      },
      {
        id: 'weekly_hours',
        label: 'Disponibilité hebdomadaire',
        description: profile.weekly_availability_hours
          ? `${profile.weekly_availability_hours}h par semaine`
          : 'Combien d\'heures par semaine ?',
        icon: <Clock className="h-4 w-4" />,
        completed: Boolean(profile.weekly_availability_hours),
        href: '/dashboard/profile',
        priority: 'recommended',
      }
    )
  }

  const completedCount = checklist.filter((item) => item.completed).length
  const totalCount = checklist.length
  const completionPercentage = Math.round((completedCount / totalCount) * 100)
  const isComplete = completedCount === totalCount

  // Don't show if profile is 100% complete
  if (isComplete && compact) {
    return null
  }

  const incompleteItems = checklist.filter((item) => !item.completed)
  const nextAction = incompleteItems[0]

  if (compact) {
    return (
      <Card className={cn('border-primary/20 bg-gradient-to-br from-primary/5 to-transparent', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Complétez votre profil</p>
                <p className="text-sm text-muted-foreground">
                  {completedCount}/{totalCount} étapes terminées
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Progress value={completionPercentage} className="h-2 w-24" />
                <span className="text-sm font-medium text-primary">{completionPercentage}%</span>
              </div>
              {nextAction?.href && (
                <Link href={nextAction.href}>
                  <Button size="sm" variant="outline" className="gap-1">
                    Continuer
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Complétez votre profil
            </CardTitle>
            <CardDescription>
              Un profil complet améliore votre expérience d'apprentissage
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
            <p className="text-xs text-muted-foreground">
              {completedCount}/{totalCount} complété
            </p>
          </div>
        </div>
        <Progress value={completionPercentage} className="mt-3 h-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 rounded-xl p-3 transition-colors',
              item.completed
                ? 'bg-green-50 dark:bg-green-950/20'
                : 'bg-muted/50 hover:bg-muted'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                item.completed
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                  : 'bg-background text-muted-foreground'
              )}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{item.label}</p>
                {item.priority === 'required' && !item.completed && (
                  <span className="text-[10px] uppercase tracking-wide text-destructive font-medium">
                    Requis
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <>
                  <Circle className="h-5 w-5 text-muted-foreground/30" />
                  {item.href && (
                    <Link href={item.href}>
                      <Button size="sm" variant="ghost" className="h-7 px-2">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {!isComplete && nextAction?.href && (
          <Link href={nextAction.href} className="block">
            <Button className="w-full mt-2 gap-2">
              Compléter maintenant
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {isComplete && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Profil complet !</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
