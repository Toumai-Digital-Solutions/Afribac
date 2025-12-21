export type UserRole = 'user' | 'member' | 'admin'
export type UserStatus = 'active' | 'suspended' | 'deleted'
export type CourseStatus = 'draft' | 'publish' | 'archived'
export type TagType = 'chapter' | 'topic' | 'difficulty' | 'exam_type' | 'school'
export type QuestionType = 'multiple_choice' | 'true_false' | 'open_ended'
export type StudyGoal = 'baccalaureat' | 'improve_grades' | 'catch_up' | 'deepen_knowledge' | 'other'

export interface Database {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          id: string
          actor_id: string
          actor_role: string | null
          action_type: string
          entity_type: string
          entity_id: string | null
          entity_name: string | null
          status: string | null
          note: string | null
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string
          actor_role?: string | null
          action_type: string
          entity_type: string
          entity_id?: string | null
          entity_name?: string | null
          status?: string | null
          note?: string | null
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string
          actor_role?: string | null
          action_type?: string
          entity_type?: string
          entity_id?: string | null
          entity_name?: string | null
          status?: string | null
          note?: string | null
          metadata?: any
          created_at?: string
        }
      }
      countries: {
        Row: {
          id: string
          name: string
          code: string
          flag_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          flag_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          flag_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      series: {
        Row: {
          id: string
          name: string
          description: string | null
          country_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          country_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          country_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          icon: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          created_at?: string
          updated_at?: string
        }
      }
      series_subjects: {
        Row: {
          id: string
          series_id: string
          subject_id: string
          coefficient: number
          created_at: string
        }
        Insert: {
          id?: string
          series_id: string
          subject_id: string
          coefficient?: number
          created_at?: string
        }
        Update: {
          id?: string
          series_id?: string
          subject_id?: string
          coefficient?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          country_id: string
          series_id: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          study_goal: StudyGoal | null
          weekly_availability_hours: number | null
          status: UserStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          country_id: string
          series_id?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          study_goal?: StudyGoal | null
          weekly_availability_hours?: number | null
          status?: UserStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          country_id?: string
          series_id?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          study_goal?: StudyGoal | null
          weekly_availability_hours?: number | null
          status?: UserStatus
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          pdf_url: string | null
          pdf_filename: string | null
          video_url: string | null
          subject_id: string
          topic_id: string | null
          difficulty_level: number
          estimated_duration: number
          status: CourseStatus
          view_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: string | null
          pdf_url?: string | null
          pdf_filename?: string | null
          video_url?: string | null
          subject_id: string
          topic_id?: string | null
          difficulty_level?: number
          estimated_duration?: number
          status?: CourseStatus
          view_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string | null
          pdf_url?: string | null
          pdf_filename?: string | null
          video_url?: string | null
          subject_id?: string
          topic_id?: string | null
          difficulty_level?: number
          estimated_duration?: number
          status?: CourseStatus
          view_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          subject_id: string
          series_id: string | null
          name: string
          slug: string
          description: string | null
          position: number
          metadata: any
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          series_id?: string | null
          name: string
          slug: string
          description?: string | null
          position?: number
          metadata?: any
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          series_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          position?: number
          metadata?: any
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          type: TagType
          color: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: TagType
          color?: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: TagType
          color?: string
          description?: string | null
          created_at?: string
        }
      }
      course_tags: {
        Row: {
          course_id: string
          tag_id: string
        }
        Insert: {
          course_id: string
          tag_id: string
        }
        Update: {
          course_id?: string
          tag_id?: string
        }
      }
      course_series: {
        Row: {
          id: string
          course_id: string
          series_id: string
          relevance_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          series_id: string
          relevance_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          series_id?: string
          relevance_notes?: string | null
          created_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          title: string
          description: string | null
          questions_content: string | null
          correction_content: string | null
          questions_pdf_url: string | null
          questions_pdf_filename: string | null
          correction_pdf_url: string | null
          correction_pdf_filename: string | null
          exam_type: 'baccalaureat' | 'school_exam' | 'mock_exam' | 'practice_test' | 'other'
          exam_year: number | null
          exam_session: string | null
          duration_minutes: number
          total_points: number | null
          subject_id: string
          series_id: string
          status: CourseStatus
          difficulty_level: number
          view_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          questions_content?: string | null
          correction_content?: string | null
          questions_pdf_url?: string | null
          questions_pdf_filename?: string | null
          correction_pdf_url?: string | null
          correction_pdf_filename?: string | null
          exam_type: 'baccalaureat' | 'school_exam' | 'mock_exam' | 'practice_test' | 'other'
          exam_year?: number | null
          exam_session?: string | null
          duration_minutes?: number
          total_points?: number | null
          subject_id: string
          series_id: string
          status?: CourseStatus
          difficulty_level?: number
          view_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          questions_content?: string | null
          correction_content?: string | null
          questions_pdf_url?: string | null
          questions_pdf_filename?: string | null
          correction_pdf_url?: string | null
          correction_pdf_filename?: string | null
          exam_type?: 'baccalaureat' | 'school_exam' | 'mock_exam' | 'practice_test' | 'other'
          exam_year?: number | null
          exam_session?: string | null
          duration_minutes?: number
          total_points?: number | null
          subject_id?: string
          series_id?: string
          status?: CourseStatus
          difficulty_level?: number
          view_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exam_tags: {
        Row: {
          exam_id: string
          tag_id: string
        }
        Insert: {
          exam_id: string
          tag_id: string
        }
        Update: {
          exam_id?: string
          tag_id?: string
        }
      }
      exam_attempts: {
        Row: {
          id: string
          user_id: string
          exam_id: string
          started_at: string
          submitted_at: string | null
          time_spent_minutes: number
          score: number | null
          is_completed: boolean
          answers: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exam_id: string
          started_at?: string
          submitted_at?: string | null
          time_spent_minutes?: number
          score?: number | null
          is_completed?: boolean
          answers?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exam_id?: string
          started_at?: string
          submitted_at?: string | null
          time_spent_minutes?: number
          score?: number | null
          is_completed?: boolean
          answers?: any
          created_at?: string
          updated_at?: string
        }
      }
      gallery_assets: {
        Row: {
          id: string
          type: 'image' | 'latex'
          title: string
          description: string | null
          file_url: string | null
          file_path: string | null
          latex_content: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'image' | 'latex'
          title: string
          description?: string | null
          file_url?: string | null
          file_path?: string | null
          latex_content?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'image' | 'latex'
          title?: string
          description?: string | null
          file_url?: string | null
          file_path?: string | null
          latex_content?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          completion_percentage: number
          time_spent: number
          last_accessed: string
          is_completed: boolean
          bookmarks: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          completion_percentage?: number
          time_spent?: number
          last_accessed?: string
          is_completed?: boolean
          bookmarks?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          completion_percentage?: number
          time_spent?: number
          last_accessed?: string
          is_completed?: boolean
          bookmarks?: any
          created_at?: string
          updated_at?: string
        }
      }
      quiz_exercises: {
        Row: {
          id: string
          title: string
          description: string | null
          content_type: 'quiz' | 'exercise'
          subject_id: string
          series_id: string
          course_id: string | null
          difficulty_level: number
          estimated_duration: number
          instructions: string | null
          status: 'draft' | 'published' | 'archived'
          view_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content_type: 'quiz' | 'exercise'
          subject_id: string
          series_id: string
          course_id?: string | null
          difficulty_level?: number
          estimated_duration?: number
          instructions?: string | null
          status?: 'draft' | 'published' | 'archived'
          view_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content_type?: 'quiz' | 'exercise'
          subject_id?: string
          series_id?: string
          course_id?: string | null
          difficulty_level?: number
          estimated_duration?: number
          instructions?: string | null
          status?: 'draft' | 'published' | 'archived'
          view_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          quiz_exercise_id: string
          question_text: string
          question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer'
          points: number
          explanation: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quiz_exercise_id: string
          question_text: string
          question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer'
          points?: number
          explanation?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quiz_exercise_id?: string
          question_text?: string
          question_type?: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer'
          points?: number
          explanation?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      answer_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          is_correct: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          is_correct?: boolean
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          option_text?: string
          is_correct?: boolean
          order_index?: number
          created_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_exercise_id: string
          user_id: string
          score: number
          max_score: number
          completed_at: string
          time_taken: number | null
          created_at: string
        }
        Insert: {
          id?: string
          quiz_exercise_id: string
          user_id: string
          score?: number
          max_score: number
          completed_at?: string
          time_taken?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          quiz_exercise_id?: string
          user_id?: string
          score?: number
          max_score?: number
          completed_at?: string
          time_taken?: number | null
          created_at?: string
        }
      }
      user_answers: {
        Row: {
          id: string
          quiz_attempt_id: string
          question_id: string
          selected_options: string[] | null
          text_answer: string | null
          is_correct: boolean
          created_at: string
        }
        Insert: {
          id?: string
          quiz_attempt_id: string
          question_id: string
          selected_options?: string[] | null
          text_answer?: string | null
          is_correct?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          quiz_attempt_id?: string
          question_id?: string
          selected_options?: string[] | null
          text_answer?: string | null
          is_correct?: boolean
          created_at?: string
        }
      }
      quiz_exercise_tags: {
        Row: {
          id: string
          quiz_exercise_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          quiz_exercise_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          quiz_exercise_id?: string
          tag_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      activity_log_details: {
        Row: {
          id: string
          actor_id: string
          actor_role: string | null
          action_type: string
          entity_type: string
          entity_id: string | null
          entity_name: string | null
          status: string | null
          note: string | null
          metadata: any
          created_at: string
          actor_name: string | null
          actor_email: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types for common operations
export type Country = Database['public']['Tables']['countries']['Row']
export type Series = Database['public']['Tables']['series']['Row']
export type Subject = Database['public']['Tables']['subjects']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type CourseSeries = Database['public']['Tables']['course_series']['Row']
export type Exam = Database['public']['Tables']['exams']['Row']
export type ExamTag = Database['public']['Tables']['exam_tags']['Row']
export type ExamAttempt = Database['public']['Tables']['exam_attempts']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type ActivityLogDetail = Database['public']['Views']['activity_log_details']['Row']

// Extended types with relations
export type SeriesWithCountry = Series & {
  country: Country
}

export type CourseWithDetails = Course & {
  subject: Subject
  topic: Topic | null
  tags: Tag[]
  series: Series[]
  created_by_profile: Profile | null
}

export type CourseWithFullDetails = Course & {
  subject: Subject
  topic: Topic | null
  tags: Tag[]
  series: (Series & { country: Country })[]
  created_by_profile: Profile | null
}

export type Topic = Database['public']['Tables']['topics']['Row']

export type ExamWithDetails = Exam & {
  subject: Subject
  series: Series & { country: Country }
  tags: Tag[]
  created_by_profile: Profile | null
}

export type ProfileWithDetails = Profile & {
  country: Country
  series: Series | null
}

export type QuizExercise = Database['public']['Tables']['quiz_exercises']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type AnswerOption = Database['public']['Tables']['answer_options']['Row']
export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row']
export type UserAnswer = Database['public']['Tables']['user_answers']['Row']
export type QuizExerciseTag = Database['public']['Tables']['quiz_exercise_tags']['Row']

export type QuizExerciseWithDetails = QuizExercise & {
  subject: Subject
  series: Series & { country: Country }
  course?: Course | null
  questions: (Question & { answer_options: AnswerOption[] })[]
  tags: Tag[]
  created_by_profile: Profile | null
}

// Mentor invite types
export type MentorInviteStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type MentorRelationship = 'parent' | 'tutor' | 'teacher' | 'mentor' | 'other'

export interface MentorInvite {
  id: string
  student_id: string
  mentor_email: string
  mentor_name: string | null
  relationship: MentorRelationship
  status: MentorInviteStatus
  invite_token: string
  mentor_profile_id: string | null
  can_view_progress: boolean
  can_view_courses: boolean
  can_receive_reports: boolean
  invited_at: string
  responded_at: string | null
  expires_at: string
  created_at: string
  updated_at: string
}

export type MentorInviteWithStudent = MentorInvite & {
  student: Profile
}

export type MentorInviteWithMentor = MentorInvite & {
  mentor_profile: Profile | null
}

// ============================================
// GAMIFICATION TYPES
// ============================================

// Points action types
export type PointsActionType =
  | 'course_started'
  | 'course_completed'
  | 'course_perfect_score'
  | 'quiz_completed'
  | 'quiz_passed'
  | 'quiz_perfect_score'
  | 'exam_completed'
  | 'exam_passed'
  | 'exam_perfect_score'
  | 'daily_streak_bonus'
  | 'weekly_streak_bonus'
  | 'streak_milestone'
  | 'challenge_completed'
  | 'challenge_won'
  | 'daily_login'
  | 'weekly_goal_met'
  | 'profile_completed'
  | 'badge_earned'
  | 'level_up'
  | 'referral_bonus'
  | 'admin_bonus'

export interface PointsConfig {
  id: string
  action_type: PointsActionType
  base_points: number
  description: string | null
  difficulty_multiplier: boolean
  score_multiplier: boolean
  streak_multiplier: boolean
  max_per_day: number | null
  cooldown_minutes: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PointsLedgerEntry {
  id: string
  user_id: string
  action_type: PointsActionType
  points: number
  reference_type: string | null
  reference_id: string | null
  metadata: Record<string, any>
  base_points: number
  multiplier: number
  created_at: string
}

export interface UserPoints {
  user_id: string
  total_points: number
  points_this_week: number
  points_this_month: number
  lifetime_points: number
  last_points_at: string | null
  updated_at: string
}

// Levels
export interface Level {
  id: string
  level_number: number
  name: string
  name_fr: string
  min_points: number
  icon: string | null
  color: string | null
  perks: string[]
  created_at: string
}

export interface UserLevel {
  user_id: string
  current_level: number
  current_xp: number
  xp_to_next: number
  level_up_count: number
  last_level_up_at: string | null
  updated_at: string
}

// Badges
export type BadgeCategory = 'progress' | 'mastery' | 'consistency' | 'achievement' | 'community' | 'seasonal'
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface BadgeCriteria {
  type: string
  count?: number
  days?: number
  hours?: number
  level?: number
  points?: number
  percent?: number
  min_score?: number
}

export interface Badge {
  id: string
  code: string
  name: string
  name_fr: string
  description: string | null
  description_fr: string | null
  category: BadgeCategory
  rarity: BadgeRarity
  icon: string
  color: string | null
  points_reward: number
  criteria: BadgeCriteria
  is_hidden: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  progress: number
  current_value: number | null
  target_value: number | null
  metadata: Record<string, any>
  is_featured: boolean
}

export type UserBadgeWithDetails = UserBadge & {
  badge: Badge
}

// Streaks
export interface UserStreak {
  user_id: string
  current_streak: number
  longest_streak: number
  streak_start_date: string | null
  last_activity_date: string | null
  weekly_streak: number
  weeks_in_a_row: number
  streak_freezes_available: number
  streak_freezes_used: number
  last_freeze_date: string | null
  total_active_days: number
  updated_at: string
}

export interface DailyActivityLog {
  id: string
  user_id: string
  activity_date: string
  courses_viewed: number
  courses_completed: number
  quizzes_completed: number
  exams_completed: number
  time_spent_minutes: number
  points_earned: number
  is_active_day: boolean
  created_at: string
  updated_at: string
}

// Gamification summary (from view)
export interface UserGamificationSummary {
  user_id: string
  total_points: number
  points_this_week: number
  lifetime_points: number
  current_level: number
  level_name: string
  level_icon: string | null
  level_color: string | null
  current_xp: number
  xp_to_next: number
  current_streak: number
  longest_streak: number
  streak_start_date: string | null
  last_activity_date: string | null
  badges_earned: number
  badges_total: number
}

// Leaderboard entry (from view)
export interface LeaderboardEntry {
  user_id: string
  full_name: string | null
  avatar_url: string | null
  country_id: string
  series_id: string | null
  total_points: number
  points_this_week: number
  level: number
  level_name: string
  level_icon: string | null
  streak: number
  badge_count: number
}

// Badge rarity colors for UI
export const BADGE_RARITY_COLORS: Record<BadgeRarity, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600' },
  uncommon: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
  rare: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  epic: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
  legendary: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700' },
}

// Level colors for UI
export const LEVEL_COLORS: Record<number, string> = {
  1: '#10B981', // green
  2: '#3B82F6', // blue
  3: '#6366F1', // indigo
  4: '#8B5CF6', // violet
  5: '#F59E0B', // amber
  6: '#EF4444', // red
  7: '#EC4899', // pink
  8: '#14B8A6', // teal
  9: '#F97316', // orange
  10: '#FFD700', // gold
}
