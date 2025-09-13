import { createClient } from '../supabase'
import type { AuthError, User } from '@supabase/supabase-js'
import type { UserRole } from '@/types/database'

export interface SignUpData {
  email: string
  password: string
  metadata?: {
    full_name?: string
    country_id?: string
    series_id?: string
    role?: UserRole
  }
}

export interface SignInData {
  email: string
  password: string
}

// Sign up with email and password + profile creation
export const signUp = async ({ email, password, metadata }: SignUpData) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/onboarding')}`
        : undefined
    }
  })

  // Profile will be automatically created by database trigger
  // No need to manually call upsertProfile anymore

  return { data, error }
}

// Sign in with email and password
export const signIn = async ({ email, password }: SignInData) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// Sign out
export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
export const getCurrentUser = async (): Promise<{ user: User | null; error: AuthError | null }> => {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Reset password
export const resetPassword = async (email: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
  return { data, error }
}

// Update user profile
export const updateProfile = async (updates: { [key: string]: any }) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  })
  return { data, error }
}

// Sign in with OAuth provider
export const signInWithProvider = async (
  provider: 'google' | 'apple' | 'facebook',
  next: string = '/dashboard'
) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    }
  })
  return { data, error }
}
