'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Medal, Loader2, TrendingUp, Calendar, Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { LeaderboardEntry } from '@/types/database'

interface LeaderboardProps {
  userId?: string
  limit?: number
  showTabs?: boolean
  className?: string
  compact?: boolean
  onViewAll?: () => void
}

type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time'

export function Leaderboard({
  userId,
  limit = 10,
  showTabs = false,
  className,
  compact = false,
  onViewAll,
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<LeaderboardPeriod>('all_time')
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const supabase = createClient()

        // Fetch leaderboard entries
        const { data } = await supabase
          .from('leaderboard')
          .select('*')
          .limit(limit)

        setEntries(data || [])

        // Find user's rank if userId provided
        if (userId && data) {
          const rank = data.findIndex((e) => e.user_id === userId)
          setUserRank(rank >= 0 ? rank + 1 : null)
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [limit, userId, period])

  const renderLeaderboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (entries.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Medal className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Le classement sera disponible prochainement</p>
          <p className="text-sm mt-1">Continuez à étudier pour y apparaître !</p>
        </div>
      )
    }

    return (
      <div className={cn('space-y-2', compact && 'space-y-1')}>
        {entries.map((entry, index) => {
          const isCurrentUser = entry.user_id === userId
          const rank = index + 1

          return (
            <div
              key={entry.user_id}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 transition-colors',
                compact && 'p-2 rounded-lg',
                isCurrentUser ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
              )}
            >
              {/* Rank */}
              <div className={cn(
                'flex shrink-0 items-center justify-center rounded-full font-bold',
                compact ? 'h-8 w-8' : 'h-10 w-10'
              )}>
                {rank === 1 ? (
                  <span className={compact ? 'text-xl' : 'text-2xl'}>🥇</span>
                ) : rank === 2 ? (
                  <span className={compact ? 'text-xl' : 'text-2xl'}>🥈</span>
                ) : rank === 3 ? (
                  <span className={compact ? 'text-xl' : 'text-2xl'}>🥉</span>
                ) : (
                  <span className="text-muted-foreground">#{rank}</span>
                )}
              </div>

              {/* Avatar & Name */}
              <Avatar className={compact ? 'h-8 w-8' : 'h-10 w-10'}>
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {entry.full_name?.substring(0, 2).toUpperCase() || '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn('font-medium truncate', compact && 'text-sm')}>
                  {entry.full_name || 'Anonyme'}
                  {isCurrentUser && <span className="text-primary ml-1">(vous)</span>}
                </p>
                {!compact && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{entry.level_icon}</span>
                    <span>Niveau {entry.level}</span>
                    <span>•</span>
                    <span>{entry.streak} 🔥</span>
                  </div>
                )}
              </div>

              {/* Points */}
              <div className="text-right">
                <p className={cn('font-bold', compact ? 'text-sm' : 'text-lg')}>
                  {entry.total_points.toLocaleString('fr-FR')}
                </p>
                {!compact && <p className="text-xs text-muted-foreground">points</p>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className={cn(compact && 'pb-3')}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={cn('flex items-center gap-2', compact && 'text-base')}>
              <Medal className={cn('text-amber-500', compact ? 'h-4 w-4' : 'h-5 w-5')} />
              Classement
            </CardTitle>
            {!compact && (
              <CardDescription>Les meilleurs étudiants de la plateforme</CardDescription>
            )}
          </div>
          {userRank && (
            <Badge variant="secondary" className={compact ? 'text-sm' : 'text-lg px-3 py-1'}>
              #{userRank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(compact && 'pt-0')}>
        {showTabs ? (
          <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="weekly" className="gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Semaine</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Mois</span>
              </TabsTrigger>
              <TabsTrigger value="all_time" className="gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Tout</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value={period} className="mt-0">
              {renderLeaderboardContent()}
            </TabsContent>
          </Tabs>
        ) : (
          renderLeaderboardContent()
        )}

        {onViewAll && entries.length > 0 && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={onViewAll}
          >
            Voir le classement complet
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Compact leaderboard widget for dashboards
 */
export function LeaderboardWidget({
  userId,
  limit = 5,
  onViewAll,
}: {
  userId?: string
  limit?: number
  onViewAll?: () => void
}) {
  return (
    <Leaderboard
      userId={userId}
      limit={limit}
      compact
      onViewAll={onViewAll}
    />
  )
}

/**
 * Leaderboard podium for top 3 display
 */
export function LeaderboardPodium({ className }: { className?: string }) {
  const [topThree, setTopThree] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopThree = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('leaderboard')
          .select('*')
          .limit(3)

        setTopThree(data || [])
      } catch (error) {
        console.error('Error fetching top 3:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopThree()
  }, [])

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (topThree.length < 3) {
    return null
  }

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [topThree[1], topThree[0], topThree[2]]
  const heights = ['h-24', 'h-32', 'h-20']
  const medals = ['🥈', '🥇', '🥉']

  return (
    <div className={cn('flex items-end justify-center gap-4', className)}>
      {podiumOrder.map((entry, index) => {
        if (!entry) return null
        const originalIndex = index === 0 ? 1 : index === 1 ? 0 : 2

        return (
          <div key={entry.user_id} className="flex flex-col items-center">
            <Avatar className="h-12 w-12 mb-2 ring-2 ring-offset-2 ring-muted">
              <AvatarImage src={entry.avatar_url || undefined} />
              <AvatarFallback>
                {entry.full_name?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium truncate max-w-[80px] text-center">
              {entry.full_name?.split(' ')[0] || 'Anonyme'}
            </p>
            <p className="text-xs text-muted-foreground">
              {entry.total_points.toLocaleString('fr-FR')} pts
            </p>
            <div
              className={cn(
                'mt-2 w-20 rounded-t-lg flex items-start justify-center pt-2',
                heights[index],
                index === 1 ? 'bg-amber-500' : index === 0 ? 'bg-slate-400' : 'bg-amber-700'
              )}
            >
              <span className="text-2xl">{medals[index]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
