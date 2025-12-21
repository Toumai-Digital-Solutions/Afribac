'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Flame,
  Trophy,
  Star,
  Zap,
  TrendingUp,
  ArrowRight,
  Loader2,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { UserGamificationSummary } from '@/types/database'

interface GamificationStatsCardProps {
  userId: string
  className?: string
  compact?: boolean
}

function getStreakEmoji(streak: number): string {
  if (streak >= 100) return '💎'
  if (streak >= 60) return '👑'
  if (streak >= 30) return '🏆'
  if (streak >= 14) return '🔥'
  if (streak >= 7) return '⭐'
  if (streak >= 3) return '💪'
  return '🌱'
}

function getStreakMessage(streak: number): string {
  if (streak >= 100) return 'Légendaire !'
  if (streak >= 60) return 'Incroyable !'
  if (streak >= 30) return 'Excellent !'
  if (streak >= 14) return 'Super !'
  if (streak >= 7) return 'Bien joué !'
  if (streak >= 3) return 'Continue !'
  if (streak >= 1) return 'C\'est parti !'
  return 'Commencez aujourd\'hui'
}

export function GamificationStatsCard({ userId, className, compact = false }: GamificationStatsCardProps) {
  const [stats, setStats] = useState<UserGamificationSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        // Try to get from the view, or construct from individual tables
        const { data: summaryData, error: summaryError } = await supabase
          .from('user_gamification_summary')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (summaryData && !summaryError) {
          setStats(summaryData)
        } else {
          // Fallback: construct from individual queries or use defaults
          // This handles the case where the view might not exist yet
          const [pointsResult, levelResult, streakResult, badgesResult] = await Promise.all([
            supabase.from('user_points').select('*').eq('user_id', userId).single(),
            supabase.from('user_levels').select('*, level:levels(*)').eq('user_id', userId).single(),
            supabase.from('user_streaks').select('*').eq('user_id', userId).single(),
            supabase.from('user_badges').select('id').eq('user_id', userId),
          ])

          const { data: badgesTotal } = await supabase
            .from('badges')
            .select('id', { count: 'exact' })
            .eq('is_active', true)

          setStats({
            user_id: userId,
            total_points: pointsResult.data?.total_points || 0,
            points_this_week: pointsResult.data?.points_this_week || 0,
            lifetime_points: pointsResult.data?.lifetime_points || 0,
            current_level: levelResult.data?.current_level || 1,
            level_name: (levelResult.data as any)?.level?.name_fr || 'Débutant',
            level_icon: (levelResult.data as any)?.level?.icon || '🌱',
            level_color: (levelResult.data as any)?.level?.color || '#10B981',
            current_xp: levelResult.data?.current_xp || 0,
            xp_to_next: levelResult.data?.xp_to_next || 100,
            current_streak: streakResult.data?.current_streak || 0,
            longest_streak: streakResult.data?.longest_streak || 0,
            streak_start_date: streakResult.data?.streak_start_date || null,
            last_activity_date: streakResult.data?.last_activity_date || null,
            badges_earned: badgesResult.data?.length || 0,
            badges_total: badgesTotal?.length || 30,
          })
        }
      } catch (error) {
        console.error('Error fetching gamification stats:', error)
        // Use defaults if everything fails
        setStats({
          user_id: userId,
          total_points: 0,
          points_this_week: 0,
          lifetime_points: 0,
          current_level: 1,
          level_name: 'Débutant',
          level_icon: '🌱',
          level_color: '#10B981',
          current_xp: 0,
          xp_to_next: 100,
          current_streak: 0,
          longest_streak: 0,
          streak_start_date: null,
          last_activity_date: null,
          badges_earned: 0,
          badges_total: 30,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const xpProgress = stats.xp_to_next > 0 ? (stats.current_xp / stats.xp_to_next) * 100 : 0

  if (compact) {
    return (
      <Card className={cn('border-primary/20 bg-gradient-to-br from-primary/5 to-transparent', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Level */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{stats.level_icon}</span>
                <div>
                  <p className="text-sm font-medium">Niv. {stats.current_level}</p>
                  <p className="text-xs text-muted-foreground">{stats.level_name}</p>
                </div>
              </div>

              {/* Points */}
              <div className="hidden sm:flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="font-medium">{stats.total_points.toLocaleString('fr-FR')}</span>
                <span className="text-xs text-muted-foreground">pts</span>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{getStreakEmoji(stats.current_streak)}</span>
                <span className="font-medium">{stats.current_streak}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">jours</span>
              </div>
            </div>

            <Link href="/student/trophies">
              <Button size="sm" variant="outline" className="gap-1">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Trophées</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Level & XP */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${stats.level_color}20` }}
              >
                {stats.level_icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Niveau</p>
                <p className="text-xl font-bold" style={{ color: stats.level_color || undefined }}>
                  {stats.current_level}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{stats.level_name}</span>
                <span className="font-medium">{stats.current_xp}/{stats.xp_to_next} XP</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
          </div>

          {/* Points */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-xl font-bold">{stats.total_points.toLocaleString('fr-FR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              <span className="text-muted-foreground">
                +{stats.points_this_week.toLocaleString('fr-FR')} cette semaine
              </span>
            </div>
          </div>

          {/* Streak */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Série</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{stats.current_streak}</p>
                  <span className="text-lg">{getStreakEmoji(stats.current_streak)}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {getStreakMessage(stats.current_streak)}
              {stats.longest_streak > stats.current_streak && (
                <span> • Record: {stats.longest_streak} jours</span>
              )}
            </p>
          </div>

          {/* Badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Badges</p>
                <p className="text-xl font-bold">
                  {stats.badges_earned}
                  <span className="text-sm font-normal text-muted-foreground">/{stats.badges_total}</span>
                </p>
              </div>
            </div>
            <Link href="/student/trophies">
              <Button variant="outline" size="sm" className="w-full gap-1">
                Voir tous
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
