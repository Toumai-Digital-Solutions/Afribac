'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Flame,
  Award,
  Star,
  Sparkles,
  ChevronUp,
  Zap,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

// ============================================
// TYPES
// ============================================

export interface PointsReward {
  type: 'points'
  amount: number
  reason: string
}

export interface BadgeReward {
  type: 'badge'
  badge: {
    id: string
    name_fr: string
    description_fr: string
    icon: string
    category: string
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  }
}

export interface StreakReward {
  type: 'streak'
  currentStreak: number
  milestone?: {
    days: number
    points: number
    message: string
  }
}

export interface LevelUpReward {
  type: 'level_up'
  newLevel: number
  levelName: string
  levelIcon: string
  levelColor: string
  bonusPoints?: number
}

export type Reward = PointsReward | BadgeReward | StreakReward | LevelUpReward

export interface RewardCelebrationProps {
  rewards: Reward[]
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
}

// ============================================
// CONFETTI EFFECTS
// ============================================

const triggerConfetti = (intensity: 'low' | 'medium' | 'high' = 'medium') => {
  const count = intensity === 'high' ? 200 : intensity === 'medium' ? 100 : 50
  const spread = intensity === 'high' ? 160 : intensity === 'medium' ? 100 : 60

  confetti({
    particleCount: count,
    spread: spread,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
  })
}

const triggerFireworks = () => {
  const duration = 2000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) return clearInterval(interval)

    const particleCount = 50 * (timeLeft / duration)
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    })
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    })
  }, 250)
}

// ============================================
// RARITY COLORS
// ============================================

const RARITY_COLORS = {
  common: 'from-slate-400 to-slate-500',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
}

const RARITY_LABELS = {
  common: 'Commun',
  uncommon: 'Peu commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
}

// ============================================
// REWARD ITEM COMPONENTS
// ============================================

function PointsRewardItem({ reward, index }: { reward: PointsReward; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 border border-amber-500/20"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
        <Zap className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{reward.reason}</p>
        <p className="text-sm text-muted-foreground">Points gagnés</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-amber-500">+{reward.amount}</p>
      </div>
    </motion.div>
  )
}

function BadgeRewardItem({ reward, index }: { reward: BadgeReward; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'relative overflow-hidden rounded-xl p-4 border',
        'bg-gradient-to-br',
        RARITY_COLORS[reward.badge.rarity]
      )}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex items-center gap-4 text-white">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-3xl shadow-lg">
          {reward.badge.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide opacity-80">
              Nouveau badge
            </span>
          </div>
          <p className="text-lg font-bold">{reward.badge.name_fr}</p>
          <p className="text-sm opacity-80">{reward.badge.description_fr}</p>
          <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-0">
            {RARITY_LABELS[reward.badge.rarity]}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}

function StreakRewardItem({ reward, index }: { reward: StreakReward; index: number }) {
  const isMilestone = !!reward.milestone

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'flex items-center gap-4 rounded-xl p-4 border',
        isMilestone
          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30'
          : 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20'
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg">
        <Flame className="h-6 w-6" />
      </div>
      <div className="flex-1">
        {isMilestone ? (
          <>
            <p className="font-bold text-foreground">{reward.milestone!.message}</p>
            <p className="text-sm text-muted-foreground">
              Jalon de série atteint : {reward.milestone!.days} jours
            </p>
          </>
        ) : (
          <>
            <p className="font-medium text-foreground">Série maintenue !</p>
            <p className="text-sm text-muted-foreground">Continuez comme ça</p>
          </>
        )}
      </div>
      <div className="text-right">
        <p className="text-3xl font-bold text-orange-500">{reward.currentStreak}</p>
        <p className="text-xs text-muted-foreground">jours</p>
        {isMilestone && (
          <p className="text-sm font-medium text-amber-500">+{reward.milestone!.points} pts</p>
        )}
      </div>
    </motion.div>
  )
}

function LevelUpRewardItem({ reward, index }: { reward: LevelUpReward; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6"
    >
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2">
            <ChevronUp className="h-6 w-6 text-primary animate-bounce" />
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Niveau supérieur !
            </span>
            <ChevronUp className="h-6 w-6 text-primary animate-bounce" />
          </div>
        </motion.div>

        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl text-5xl shadow-xl mb-3"
          style={{ backgroundColor: `${reward.levelColor}20` }}
        >
          {reward.levelIcon}
        </div>

        <p className="text-3xl font-bold">Niveau {reward.newLevel}</p>
        <p className="text-lg text-muted-foreground">{reward.levelName}</p>

        {reward.bonusPoints && (
          <Badge className="mt-3" variant="secondary">
            Bonus : +{reward.bonusPoints} points
          </Badge>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function RewardCelebration({
  rewards,
  open,
  onClose,
  title = 'Félicitations !',
  subtitle = 'Vous avez gagné des récompenses',
}: RewardCelebrationProps) {
  const [showContent, setShowContent] = useState(false)

  // Calculate total points
  const totalPoints = rewards.reduce((acc, reward) => {
    if (reward.type === 'points') return acc + reward.amount
    if (reward.type === 'streak' && reward.milestone) return acc + reward.milestone.points
    if (reward.type === 'level_up' && reward.bonusPoints) return acc + reward.bonusPoints
    return acc
  }, 0)

  // Determine celebration intensity
  const hasLevelUp = rewards.some((r) => r.type === 'level_up')
  const hasLegendaryBadge = rewards.some(
    (r) => r.type === 'badge' && r.badge.rarity === 'legendary'
  )
  const hasEpicBadge = rewards.some(
    (r) => r.type === 'badge' && r.badge.rarity === 'epic'
  )
  const hasMilestone = rewards.some(
    (r) => r.type === 'streak' && r.milestone
  )

  useEffect(() => {
    if (open) {
      // Delay content appearance
      setTimeout(() => setShowContent(true), 100)

      // Trigger confetti based on reward significance
      if (hasLevelUp || hasLegendaryBadge) {
        triggerFireworks()
      } else if (hasEpicBadge || hasMilestone) {
        triggerConfetti('high')
      } else if (rewards.length > 1) {
        triggerConfetti('medium')
      } else {
        triggerConfetti('low')
      }
    } else {
      setShowContent(false)
    }
  }, [open, hasLevelUp, hasLegendaryBadge, hasEpicBadge, hasMilestone, rewards.length])

  // Sort rewards: level_up first, then badges, then streak, then points
  const sortedRewards = [...rewards].sort((a, b) => {
    const order = { level_up: 0, badge: 1, streak: 2, points: 3 }
    return order[a.type] - order[b.type]
  })

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: showContent ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
          >
            <Trophy className="h-8 w-8 text-white" />
          </motion.div>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <p className="text-muted-foreground">{subtitle}</p>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 max-h-[50vh] overflow-y-auto py-2"
            >
              {sortedRewards.map((reward, index) => {
                switch (reward.type) {
                  case 'points':
                    return <PointsRewardItem key={index} reward={reward} index={index} />
                  case 'badge':
                    return <BadgeRewardItem key={index} reward={reward} index={index} />
                  case 'streak':
                    return <StreakRewardItem key={index} reward={reward} index={index} />
                  case 'level_up':
                    return <LevelUpRewardItem key={index} reward={reward} index={index} />
                  default:
                    return null
                }
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {totalPoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 pt-2 text-lg font-semibold"
          >
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Total : +{totalPoints} points</span>
          </motion.div>
        )}

        <div className="pt-4">
          <Button onClick={onClose} className="w-full" size="lg">
            Continuer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// MINI REWARD TOAST (for smaller rewards)
// ============================================

export function useRewardToast() {
  const showPointsToast = (amount: number, reason: string) => {
    // We'll use Sonner for this
    const { toast } = require('sonner')
    toast.success(
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">+{amount} points</p>
          <p className="text-sm text-muted-foreground">{reason}</p>
        </div>
      </div>,
      { duration: 3000 }
    )
  }

  const showStreakToast = (streak: number) => {
    const { toast } = require('sonner')
    toast.success(
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
          <Flame className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">{streak} jours de série</p>
          <p className="text-sm text-muted-foreground">Continuez comme ça !</p>
        </div>
      </div>,
      { duration: 3000 }
    )
  }

  return { showPointsToast, showStreakToast }
}
