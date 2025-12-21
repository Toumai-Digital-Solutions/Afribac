'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  Award,
  Flame,
  Star,
  Medal,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { GamificationStatsCard } from '@/components/gamification/gamification-stats-card'
import { BadgesShowcase } from '@/components/gamification/badges-showcase'
import { Leaderboard, LeaderboardPodium } from '@/components/gamification/leaderboard'
import {
  getStreakEmoji,
  getStreakTierName,
  getStreakColor,
  getNextMilestone,
  getDaysToNextMilestone,
  generateWeeklyCalendar,
  STREAK_CONFIG,
} from '@/lib/gamification/streak-rules'
import type { Profile, UserGamificationSummary, Level } from '@/types/database'

interface TrophiesPageContentProps {
  userId: string
  profile: Profile
}

const DAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function TrophiesPageContent({ userId, profile }: TrophiesPageContentProps) {
  const [stats, setStats] = useState<UserGamificationSummary | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [activityDates, setActivityDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Fetch gamification summary
        const { data: summaryData } = await supabase
          .from('user_gamification_summary')
          .select('*')
          .eq('user_id', userId)
          .single()

        // Fetch all levels
        const { data: levelsData } = await supabase
          .from('levels')
          .select('*')
          .order('level_number')

        // Fetch recent activity dates
        const { data: activityData } = await supabase
          .from('daily_activity_log')
          .select('activity_date')
          .eq('user_id', userId)
          .eq('is_active_day', true)
          .order('activity_date', { ascending: false })
          .limit(30)

        // Set default stats if not found
        const defaultStats: UserGamificationSummary = {
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
        }

        setStats(summaryData || defaultStats)
        setLevels(levelsData || [])
        setActivityDates(
          (activityData || []).map((a: { activity_date: string }) => new Date(a.activity_date))
        )
      } catch (error) {
        console.error('Error fetching trophies data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const weeklyCalendar = generateWeeklyCalendar(activityDates)
  const nextMilestone = stats ? getNextMilestone(stats.current_streak) : null
  const daysToMilestone = stats ? getDaysToNextMilestone(stats.current_streak) : 0

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10 opacity-30" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
                <Trophy className="h-4 w-4" />
                Salle des trophées
              </div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                Vos accomplissements
              </h1>
              <p className="max-w-lg text-white/80">
                Suivez votre progression, débloquez des badges et grimpez dans le classement.
                Chaque effort compte !
              </p>
            </div>

            {stats && (
              <div className="grid grid-cols-3 gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.current_level}</div>
                  <div className="text-xs text-white/70">Niveau</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.total_points.toLocaleString('fr-FR')}</div>
                  <div className="text-xs text-white/70">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.badges_earned}</div>
                  <div className="text-xs text-white/70">Badges</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats Card */}
      <GamificationStatsCard userId={userId} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-1">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-1">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="streaks" className="gap-1">
            <Flame className="h-4 w-4" />
            <span className="hidden sm:inline">Séries</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1">
            <Medal className="h-4 w-4" />
            <span className="hidden sm:inline">Classement</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Progression de niveau
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {stats && (
                  <>
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                        style={{ backgroundColor: `${stats.level_color}20` }}
                      >
                        {stats.level_icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">Niveau {stats.current_level}</p>
                            <p className="text-muted-foreground">{stats.level_name}</p>
                          </div>
                          {stats.current_level < 10 && (
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Prochain niveau</p>
                              <p className="font-medium">
                                {levels.find((l) => l.level_number === stats.current_level + 1)?.name_fr}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>XP: {stats.current_xp} / {stats.xp_to_next}</span>
                        <span className="text-muted-foreground">
                          {Math.round((stats.current_xp / stats.xp_to_next) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(stats.current_xp / stats.xp_to_next) * 100}
                        className="h-3"
                      />
                    </div>

                    {/* Level progression */}
                    <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
                      {levels.slice(0, 10).map((level) => (
                        <div
                          key={level.level_number}
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition-all',
                            level.level_number < stats.current_level
                              ? 'bg-primary text-primary-foreground'
                              : level.level_number === stats.current_level
                              ? 'ring-2 ring-primary ring-offset-2'
                              : 'bg-muted text-muted-foreground'
                          )}
                          title={level.name_fr}
                        >
                          {level.icon}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Streak Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Série d'étude
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {stats && (
                  <>
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                        style={{ backgroundColor: `${getStreakColor(stats.current_streak)}20` }}
                      >
                        {getStreakEmoji(stats.current_streak)}
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{stats.current_streak} jours</p>
                        <p className="text-muted-foreground">{getStreakTierName(stats.current_streak)}</p>
                      </div>
                    </div>

                    {/* Weekly calendar */}
                    <div>
                      <p className="text-sm font-medium mb-3">Cette semaine</p>
                      <div className="flex justify-between gap-1">
                        {weeklyCalendar.map((day, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-xs text-muted-foreground">{DAY_NAMES[i]}</span>
                            <div
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                                day.isToday && 'ring-2 ring-primary ring-offset-2',
                                day.isFuture && 'opacity-30',
                                day.isActive
                                  ? 'bg-green-500 text-white'
                                  : 'bg-muted'
                              )}
                            >
                              {day.isActive ? '✓' : day.isFuture ? '' : '·'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next milestone */}
                    {nextMilestone && (
                      <div className="rounded-xl bg-muted/50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Prochain jalon</p>
                            <p className="font-medium">{nextMilestone.days} jours</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Dans</p>
                            <p className="font-medium">{daysToMilestone} jours</p>
                          </div>
                        </div>
                        <Progress
                          value={(stats.current_streak / nextMilestone.days) * 100}
                          className="h-2 mt-3"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Record personnel</span>
                      <span className="font-medium">{stats.longest_streak} jours</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Badges */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Derniers badges obtenus</CardTitle>
                <CardDescription>Vos accomplissements récents</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('badges')}>
                Voir tous
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <BadgesShowcase userId={userId} className="border-0 shadow-none" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6">
          <BadgesShowcase userId={userId} showAll />
        </TabsContent>

        {/* Streaks Tab */}
        <TabsContent value="streaks" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Current Streak */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Votre série actuelle</CardTitle>
                <CardDescription>
                  Maintenez votre série en étudiant chaque jour
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {stats && (
                  <>
                    <div className="flex items-center gap-6">
                      <div
                        className="flex h-24 w-24 items-center justify-center rounded-3xl text-5xl"
                        style={{ backgroundColor: `${getStreakColor(stats.current_streak)}20` }}
                      >
                        {getStreakEmoji(stats.current_streak)}
                      </div>
                      <div>
                        <p className="text-5xl font-bold" style={{ color: getStreakColor(stats.current_streak) }}>
                          {stats.current_streak}
                        </p>
                        <p className="text-xl text-muted-foreground">jours consécutifs</p>
                        <Badge variant="secondary" className="mt-2">
                          {getStreakTierName(stats.current_streak)}
                        </Badge>
                      </div>
                    </div>

                    {/* Activity thresholds */}
                    <div className="rounded-xl border p-4">
                      <p className="font-medium mb-3">Comment maintenir votre série ?</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Accomplissez au moins une de ces actions chaque jour :
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Étudier {STREAK_CONFIG.DAILY_ACTIVITY_THRESHOLD.MIN_STUDY_MINUTES}+ minutes
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Voir {STREAK_CONFIG.DAILY_ACTIVITY_THRESHOLD.MIN_COURSES_VIEWED}+ cours
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Compléter {STREAK_CONFIG.DAILY_ACTIVITY_THRESHOLD.MIN_QUIZZES_COMPLETED}+ quiz
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Commencer {STREAK_CONFIG.DAILY_ACTIVITY_THRESHOLD.MIN_EXAMS_STARTED}+ examen
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Streak Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Jalons de série</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {STREAK_CONFIG.MILESTONES.map((milestone) => {
                    const reached = stats ? stats.current_streak >= milestone.days : false
                    const progress = stats
                      ? Math.min((stats.current_streak / milestone.days) * 100, 100)
                      : 0

                    return (
                      <div
                        key={milestone.days}
                        className={cn(
                          'rounded-lg border p-3',
                          reached ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : ''
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {reached ? '✅' : getStreakEmoji(milestone.days)}
                            </span>
                            <span className="font-medium">{milestone.days} jours</span>
                          </div>
                          <Badge variant={reached ? 'default' : 'secondary'}>
                            +{milestone.points} pts
                          </Badge>
                        </div>
                        {!reached && (
                          <Progress value={progress} className="h-1.5" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Activity Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Vos 30 derniers jours d'étude</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 30 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (29 - i))
                  date.setHours(0, 0, 0, 0)
                  const isActive = activityDates.some((d) => {
                    const actDate = new Date(d)
                    actDate.setHours(0, 0, 0, 0)
                    return actDate.getTime() === date.getTime()
                  })
                  const isToday = i === 29

                  return (
                    <div
                      key={i}
                      className={cn(
                        'h-8 w-8 rounded',
                        isActive ? 'bg-green-500' : 'bg-muted',
                        isToday && 'ring-2 ring-primary ring-offset-1'
                      )}
                      title={date.toLocaleDateString('fr-FR')}
                    />
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted" />
                  Inactif
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-500" />
                  Actif
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6 mt-6">
          {/* Podium for top 3 */}
          <Card>
            <CardHeader>
              <CardTitle>Top 3 de la semaine</CardTitle>
              <CardDescription>Les meilleurs étudiants cette semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardPodium />
            </CardContent>
          </Card>

          {/* Full leaderboard with tabs */}
          <Leaderboard userId={userId} limit={20} showTabs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
