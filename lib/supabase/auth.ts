import { supabase } from '../supabase'
import { upsertProfile } from '../database'
import type { AuthError, User } from '@supabase/supabase-js'
import type { UserRole } from '@/types/database'

export interface SignUpData {
  email: string
  password: string
  full_name: string
  country_id: string
  series_id?: string // Required for students, optional for members/admins
  role?: UserRole
}

export interface SignInData {
  email: string
  password: string
}

// Sign up with email and password + profile creation
export const signUp = async ({ email, password, full_name, country_id, series_id, role = 'user' }: SignUpData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        country_id,
        series_id,
        role
      }
    }
  })

  // Profile will be automatically created by database trigger
  // No need to manually call upsertProfile anymore

  return { data, error }
}

// Sign in with email and password
export const signIn = async ({ email, password }: SignInData) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
export const getCurrentUser = async (): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Reset password
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
  return { data, error }
}

// Update user profile
export const updateProfile = async (updates: { [key: string]: any }) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  })
  return { data, error }
}

// Sign in with OAuth provider
export const signInWithProvider = async (provider: 'google' | 'github' | 'facebook' | 'twitter') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}
