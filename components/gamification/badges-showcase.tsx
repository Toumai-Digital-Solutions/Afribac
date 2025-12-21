'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import {
  Award,
  Trophy,
  Target,
  Flame,
  Star,
  Users,
  Calendar,
  Lock,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Badge, UserBadgeWithDetails, BadgeCategory, BadgeRarity, BADGE_RARITY_COLORS } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface BadgesShowcaseProps {
  userId: string
  className?: string
  showAll?: boolean // Show all badges including locked
}

const CATEGORY_CONFIG: Record<BadgeCategory, { label: string; icon: React.ReactNode; description: string }> = {
  progress: {
    label: 'Progression',
    icon: <Target className="h-4 w-4" />,
    description: 'Badges de progression et jalons',
  },
  mastery: {
    label: 'Maîtrise',
    icon: <Star className="h-4 w-4" />,
    description: 'Badges de compétence et expertise',
  },
  consistency: {
    label: 'Régularité',
    icon: <Flame className="h-4 w-4" />,
    description: 'Badges de constance et persévérance',
  },
  achievement: {
    label: 'Accomplissement',
    icon: <Trophy className="h-4 w-4" />,
    description: 'Badges d\'accomplissements spéciaux',
  },
  community: {
    label: 'Communauté',
    icon: <Users className="h-4 w-4" />,
    description: 'Badges sociaux et communautaires',
  },
  seasonal: {
    label: 'Saisonnier',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Badges d\'événements spéciaux',
  },
}

const RARITY_CONFIG: Record<BadgeRarity, { label: string; gradient: string; border: string }> = {
  common: {
    label: 'Commun',
    gradient: 'from-slate-200 to-slate-300',
    border: 'border-slate-300',
  },
  uncommon: {
    label: 'Peu commun',
    gradient: 'from-green-200 to-green-300',
    border: 'border-green-400',
  },
  rare: {
    label: 'Rare',
    gradient: 'from-blue-200 to-blue-400',
    border: 'border-blue-500',
  },
  epic: {
    label: 'Épique',
    gradient: 'from-purple-300 to-purple-500',
    border: 'border-purple-500',
  },
  legendary: {
    label: 'Légendaire',
    gradient: 'from-amber-300 via-yellow-400 to-amber-500',
    border: 'border-amber-500',
  },
}

interface BadgeWithEarned extends Badge {
  earned?: boolean
  earnedAt?: string
  progress?: number
  currentValue?: number
  targetValue?: number
}

function BadgeCard({ badge, earned, compact = false }: { badge: BadgeWithEarned; earned: boolean; compact?: boolean }) {
  const rarityConfig = RARITY_CONFIG[badge.rarity]
  const isLocked = !earned && badge.is_hidden

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'relative flex h-16 w-16 items-center justify-center rounded-xl border-2 text-2xl transition-all',
                earned
                  ? `bg-gradient-to-br ${rarityConfig.gradient} ${rarityConfig.border} shadow-md`
                  : 'border-dashed border-muted-foreground/30 bg-muted/30 grayscale opacity-50'
              )}
            >
              {isLocked ? (
                <Lock className="h-6 w-6 text-muted-foreground" />
              ) : (
                badge.icon
              )}
              {earned && badge.rarity !== 'common' && (
                <div className="absolute -top-1 -right-1">
                  <span className="text-xs">{badge.rarity === 'legendary' ? '✨' : badge.rarity === 'epic' ? '💜' : badge.rarity === 'rare' ? '💙' : '💚'}</span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{badge.name_fr}</p>
              <p className="text-xs text-muted-foreground">{badge.description_fr}</p>
              {earned && badge.earnedAt && (
                <p className="text-xs text-muted-foreground">
                  Obtenu {formatDistanceToNow(new Date(badge.earnedAt), { locale: fr, addSuffix: true })}
                </p>
              )}
              {!earned && badge.progress !== undefined && badge.progress < 100 && (
                <div className="pt-1">
                  <Progress value={badge.progress} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {badge.currentValue}/{badge.targetValue}
                  </p>
                </div>
              )}
              <BadgeUI variant="outline" className="text-xs mt-1">
                {rarityConfig.label}
              </BadgeUI>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 p-4 transition-all',
        earned
          ? `bg-gradient-to-br ${rarityConfig.gradient}/20 ${rarityConfig.border}`
          : 'border-dashed border-muted-foreground/30 bg-muted/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl text-2xl',
            earned
              ? `bg-gradient-to-br ${rarityConfig.gradient}`
              : 'bg-muted grayscale opacity-50'
          )}
        >
          {isLocked ? <Lock className="h-5 w-5 text-muted-foreground" /> : badge.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn('font-medium truncate', !earned && 'text-muted-foreground')}>
              {isLocked ? '???' : badge.name_fr}
            </h4>
            <BadgeUI variant="outline" className="text-[10px] shrink-0">
              {rarityConfig.label}
            </BadgeUI>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {isLocked ? 'Badge caché - Complétez des défis pour le découvrir' : badge.description_fr}
          </p>
          {earned && badge.earnedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Obtenu {formatDistanceToNow(new Date(badge.earnedAt), { locale: fr, addSuffix: true })}
            </p>
          )}
          {!earned && badge.progress !== undefined && badge.progress > 0 && badge.progress < 100 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progression</span>
                <span>{badge.currentValue}/{badge.targetValue}</span>
              </div>
              <Progress value={badge.progress} className="h-1.5" />
            </div>
          )}
        </div>
      </div>
      {badge.points_reward > 0 && (
        <div className="absolute top-2 right-2">
          <BadgeUI variant="secondary" className="text-xs gap-1">
            +{badge.points_reward} pts
          </BadgeUI>
        </div>
      )}
    </div>
  )
}

export function BadgesShowcase({ userId, className, showAll = true }: BadgesShowcaseProps) {
  const [allBadges, setAllBadges] = useState<BadgeWithEarned[]>([])
  const [earnedBadges, setEarnedBadges] = useState<UserBadgeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<BadgeCategory | 'all'>('all')

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const supabase = createClient()

        // Fetch all badges
        const { data: badges, error: badgesError } = await supabase
          .from('badges')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')

        if (badgesError) throw badgesError

        // Fetch user's earned badges
        const { data: userBadges, error: userBadgesError } = await supabase
          .from('user_badges')
          .select('*, badge:badges(*)')
          .eq('user_id', userId)

        if (userBadgesError) throw userBadgesError

        // Create a map of earned badges
        const earnedMap = new Map(
          (userBadges || []).map((ub: any) => [
            ub.badge_id,
            { earnedAt: ub.earned_at, progress: ub.progress, currentValue: ub.current_value, targetValue: ub.target_value },
          ])
        )

        // Merge badges with earned status
        const mergedBadges: BadgeWithEarned[] = (badges || []).map((badge: Badge) => {
          const earnedData = earnedMap.get(badge.id)
          return {
            ...badge,
            earned: Boolean(earnedData),
            earnedAt: earnedData?.earnedAt,
            progress: earnedData?.progress,
            currentValue: earnedData?.currentValue,
            targetValue: earnedData?.targetValue,
          }
        })

        setAllBadges(mergedBadges)
        setEarnedBadges(userBadges || [])
      } catch (error) {
        console.error('Error fetching badges:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBadges()
  }, [userId])

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const filteredBadges = activeCategory === 'all'
    ? allBadges
    : allBadges.filter((b) => b.category === activeCategory)

  const earnedCount = allBadges.filter((b) => b.earned).length
  const totalCount = allBadges.length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Mes badges
            </CardTitle>
            <CardDescription>
              {earnedCount} sur {totalCount} badges débloqués
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{earnedCount}</p>
            <p className="text-xs text-muted-foreground">badges</p>
          </div>
        </div>
        <Progress value={(earnedCount / totalCount) * 100} className="h-2 mt-3" />
      </CardHeader>

      <CardContent>
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as BadgeCategory | 'all')}>
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="all" className="gap-1">
              <Trophy className="h-3.5 w-3.5" />
              Tous
            </TabsTrigger>
            {(Object.keys(CATEGORY_CONFIG) as BadgeCategory[]).map((category) => {
              const config = CATEGORY_CONFIG[category]
              const count = allBadges.filter((b) => b.category === category && b.earned).length
              const total = allBadges.filter((b) => b.category === category).length
              if (total === 0) return null
              return (
                <TabsTrigger key={category} value={category} className="gap-1">
                  {config.icon}
                  <span className="hidden sm:inline">{config.label}</span>
                  <span className="text-xs text-muted-foreground">({count}/{total})</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            {filteredBadges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun badge dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBadges
                  .sort((a, b) => {
                    // Sort: earned first, then by rarity (legendary first), then by sort_order
                    if (a.earned && !b.earned) return -1
                    if (!a.earned && b.earned) return 1
                    const rarityOrder: BadgeRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common']
                    const aRarity = rarityOrder.indexOf(a.rarity)
                    const bRarity = rarityOrder.indexOf(b.rarity)
                    if (aRarity !== bRarity) return aRarity - bRarity
                    return a.sort_order - b.sort_order
                  })
                  .map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} earned={badge.earned || false} />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
