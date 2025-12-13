'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { getCurrentUserProfile } from '@/lib/database'
import type { ProfileWithDetails } from '@/types/database'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  // Create supabase client
  const supabase = createClient()

  const loadProfile = async (user: User | null) => {
    if (user) {
      const userProfile = await getCurrentUserProfile()
      setProfile(userProfile)
    } else {
      setProfile(null)
    }
  }

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      await loadProfile(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user ?? null
        setUser(newUser)
        await loadProfile(newUser)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isMember: profile?.role === 'member',
    isStudent: profile?.role === 'user',
    signOut: () => supabase.auth.signOut(),
    refreshProfile: () => loadProfile(user)
  }
}
