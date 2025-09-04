export type UserRole = 'user' | 'member' | 'admin'
export type UserStatus = 'active' | 'suspended' | 'deleted'
export type CourseStatus = 'draft' | 'publish' | 'archived'
export type TagType = 'chapter' | 'topic' | 'difficulty' | 'exam_type' | 'school'
export type QuestionType = 'multiple_choice' | 'true_false' | 'open_ended'

export interface Database {
  public: {
    Tables: {
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
          difficulty_level?: number
          estimated_duration?: number
          status?: CourseStatus
          view_count?: number
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
    }
    Views: {
      [_ in never]: never
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
export type UserProgress = Database['public']['Tables']['user_progress']['Row']

// Extended types with relations
export type SeriesWithCountry = Series & {
  country: Country
}

export type CourseWithDetails = Course & {
  subject: Subject
  tags: Tag[]
  created_by_profile: Profile | null
}

export type ProfileWithDetails = Profile & {
  country: Country
  series: Series | null
}
