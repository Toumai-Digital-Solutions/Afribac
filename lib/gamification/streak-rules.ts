/**
 * AFRIBAC STREAK SYSTEM RULES
 *
 * A streak represents consecutive days of active learning.
 * This file defines the rules for streak calculation, recovery, and rewards.
 */

// ============================================
// STREAK CONFIGURATION
// ============================================

export const STREAK_CONFIG = {
  /**
   * Minimum activity required to count as an "active day"
   * User must meet AT LEAST ONE of these thresholds
   */
  DAILY_ACTIVITY_THRESHOLD: {
    // Time-based: Study for at least 5 minutes
    MIN_STUDY_MINUTES: 5,
    // Action-based alternatives (any one counts)
    MIN_COURSES_VIEWED: 1,
    MIN_QUIZZES_COMPLETED: 1,
    MIN_EXAMS_STARTED: 1,
  },

  /**
   * Streak freeze system
   * Allows users to protect their streak on missed days
   */
  STREAK_FREEZE: {
    // How many freezes a user can hold at once
    MAX_FREEZES: 2,
    // How to earn a freeze
    EARN_FREEZE_EVERY_DAYS: 7, // Earn 1 freeze every 7 active days
    // Cost to purchase a freeze (future feature)
    FREEZE_COST_POINTS: 100,
    // Auto-apply freeze on missed day?
    AUTO_APPLY: true,
  },

  /**
   * Streak recovery (grace period)
   * Gives users a chance to recover a broken streak
   */
  RECOVERY: {
    // Hours after midnight to still count for previous day
    GRACE_PERIOD_HOURS: 4, // Until 4 AM counts as previous day
    // Can recover streak within this many hours of breaking
    RECOVERY_WINDOW_HOURS: 24,
    // Recovery requires extra activity
    RECOVERY_MULTIPLIER: 1.5, // 50% more activity than normal threshold
  },

  /**
   * Weekly streak (bonus system)
   * Rewards for completing all 7 days
   */
  WEEKLY: {
    // Days required for weekly streak
    DAYS_REQUIRED: 7,
    // Bonus points for completing a week
    COMPLETION_BONUS: 50,
    // Extra bonus for perfect week (all 7 days)
    PERFECT_WEEK_BONUS: 100,
  },

  /**
   * Streak milestones
   * Special rewards at certain streak lengths
   */
  MILESTONES: [
    { days: 3, points: 15, badge: 'streak_3', message: 'Bon début !' },
    { days: 7, points: 50, badge: 'streak_7', message: 'Une semaine complète !' },
    { days: 14, points: 100, badge: 'streak_14', message: 'Deux semaines !' },
    { days: 30, points: 200, badge: 'streak_30', message: 'Un mois entier !' },
    { days: 60, points: 400, badge: 'streak_60', message: 'Deux mois !' },
    { days: 100, points: 1000, badge: 'streak_100', message: 'Incroyable !' },
    { days: 365, points: 5000, badge: 'streak_365', message: 'Une année complète !' },
  ],
} as const

// ============================================
// STREAK DISPLAY CONFIGURATION
// ============================================

export const STREAK_DISPLAY = {
  /**
   * Emoji indicators based on streak length
   */
  EMOJI: {
    0: '🌱', // Just starting
    1: '🌱',
    3: '💪',
    7: '⭐',
    14: '🔥',
    30: '🏆',
    60: '👑',
    100: '💎',
    365: '🌟',
  } as Record<number, string>,

  /**
   * Streak tier names
   */
  TIER_NAMES: {
    0: 'Débutant',
    3: 'En route',
    7: 'Régulier',
    14: 'Assidu',
    30: 'Champion',
    60: 'Maître',
    100: 'Légende',
    365: 'Immortel',
  } as Record<number, string>,

  /**
   * Motivation messages based on streak status
   */
  MESSAGES: {
    NO_STREAK: 'Commencez votre série aujourd\'hui !',
    AT_RISK: 'Étudiez aujourd\'hui pour garder votre série !',
    SAFE: 'Série en cours - Continuez comme ça !',
    FROZEN: 'Série protégée par un gel',
    BROKEN: 'Série interrompue - Recommencez !',
    RECOVERED: 'Série récupérée !',
  },

  /**
   * Colors for streak display
   */
  COLORS: {
    0: '#94a3b8', // slate
    3: '#22c55e', // green
    7: '#3b82f6', // blue
    14: '#f97316', // orange
    30: '#eab308', // yellow
    60: '#ec4899', // pink
    100: '#8b5cf6', // purple
    365: '#ffd700', // gold
  } as Record<number, string>,
} as const

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get the appropriate emoji for a streak length
 */
export function getStreakEmoji(streak: number): string {
  const thresholds = Object.keys(STREAK_DISPLAY.EMOJI)
    .map(Number)
    .sort((a, b) => b - a)

  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return STREAK_DISPLAY.EMOJI[threshold]
    }
  }
  return '🌱'
}

/**
 * Get the tier name for a streak length
 */
export function getStreakTierName(streak: number): string {
  const thresholds = Object.keys(STREAK_DISPLAY.TIER_NAMES)
    .map(Number)
    .sort((a, b) => b - a)

  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return STREAK_DISPLAY.TIER_NAMES[threshold]
    }
  }
  return 'Débutant'
}

/**
 * Get the color for a streak length
 */
export function getStreakColor(streak: number): string {
  const thresholds = Object.keys(STREAK_DISPLAY.COLORS)
    .map(Number)
    .sort((a, b) => b - a)

  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return STREAK_DISPLAY.COLORS[threshold]
    }
  }
  return '#94a3b8'
}

/**
 * Check if activity meets the daily threshold
 */
export function meetsActivityThreshold(activity: {
  studyMinutes?: number
  coursesViewed?: number
  quizzesCompleted?: number
  examsStarted?: number
}): boolean {
  const threshold = STREAK_CONFIG.DAILY_ACTIVITY_THRESHOLD

  return (
    (activity.studyMinutes ?? 0) >= threshold.MIN_STUDY_MINUTES ||
    (activity.coursesViewed ?? 0) >= threshold.MIN_COURSES_VIEWED ||
    (activity.quizzesCompleted ?? 0) >= threshold.MIN_QUIZZES_COMPLETED ||
    (activity.examsStarted ?? 0) >= threshold.MIN_EXAMS_STARTED
  )
}

/**
 * Get the next milestone for a streak
 */
export function getNextMilestone(currentStreak: number): typeof STREAK_CONFIG.MILESTONES[number] | null {
  return STREAK_CONFIG.MILESTONES.find((m) => m.days > currentStreak) || null
}

/**
 * Get days until next milestone
 */
export function getDaysToNextMilestone(currentStreak: number): number {
  const next = getNextMilestone(currentStreak)
  return next ? next.days - currentStreak : 0
}

/**
 * Check if a streak milestone was just reached
 */
export function checkMilestoneReached(previousStreak: number, newStreak: number): typeof STREAK_CONFIG.MILESTONES[number] | null {
  return STREAK_CONFIG.MILESTONES.find(
    (m) => m.days > previousStreak && m.days <= newStreak
  ) || null
}

/**
 * Calculate if user is in the grace period (activity counts for previous day)
 */
export function isInGracePeriod(date: Date = new Date()): boolean {
  const hours = date.getHours()
  return hours < STREAK_CONFIG.RECOVERY.GRACE_PERIOD_HOURS
}

/**
 * Get the effective date for activity tracking (handles grace period)
 */
export function getEffectiveActivityDate(date: Date = new Date()): Date {
  if (isInGracePeriod(date)) {
    // Return previous day
    const previousDay = new Date(date)
    previousDay.setDate(previousDay.getDate() - 1)
    previousDay.setHours(12, 0, 0, 0) // Noon of previous day
    return previousDay
  }
  return date
}

/**
 * Generate weekly streak calendar data
 */
export function generateWeeklyCalendar(
  activityDates: Date[],
  referenceDate: Date = new Date()
): { date: Date; isActive: boolean; isToday: boolean; isFuture: boolean }[] {
  const calendar = []
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)

  const activitySet = new Set(
    activityDates.map((d) => {
      const date = new Date(d)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
  )

  // Get Monday of current week
  const monday = new Date(today)
  const day = monday.getDay()
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1)
  monday.setDate(diff)

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    date.setHours(0, 0, 0, 0)

    calendar.push({
      date,
      isActive: activitySet.has(date.getTime()),
      isToday: date.getTime() === today.getTime(),
      isFuture: date.getTime() > today.getTime(),
    })
  }

  return calendar
}

/**
 * Get streak status message
 */
export function getStreakStatusMessage(
  currentStreak: number,
  hasStudiedToday: boolean,
  hasFreezeAvailable: boolean
): string {
  if (currentStreak === 0) {
    return STREAK_DISPLAY.MESSAGES.NO_STREAK
  }

  if (!hasStudiedToday) {
    return STREAK_DISPLAY.MESSAGES.AT_RISK
  }

  return STREAK_DISPLAY.MESSAGES.SAFE
}

// ============================================
// STREAK REWARD CALCULATION
// ============================================

/**
 * Calculate daily streak bonus points
 */
export function calculateDailyStreakBonus(currentStreak: number): number {
  // Base bonus is 5 points
  let bonus = 5

  // Add multiplier based on streak length
  if (currentStreak >= 30) {
    bonus += 5 // +5 for 30+ days
  }
  if (currentStreak >= 60) {
    bonus += 5 // +5 for 60+ days
  }
  if (currentStreak >= 100) {
    bonus += 10 // +10 for 100+ days
  }

  return bonus
}

/**
 * Calculate weekly completion bonus
 */
export function calculateWeeklyBonus(consecutiveWeeks: number, isPerfectWeek: boolean): number {
  let bonus = STREAK_CONFIG.WEEKLY.COMPLETION_BONUS

  if (isPerfectWeek) {
    bonus += STREAK_CONFIG.WEEKLY.PERFECT_WEEK_BONUS
  }

  // Add bonus for consecutive weeks
  bonus += Math.min(consecutiveWeeks * 10, 50) // Up to +50 for 5+ weeks

  return bonus
}
