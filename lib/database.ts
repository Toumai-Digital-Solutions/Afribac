import { createClient } from './supabase'
import type { Database, Profile, ProfileWithDetails, UserRole } from '@/types/database'

export async function getCurrentUserProfile(): Promise<ProfileWithDetails | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      country:countries(*),
      series:series(*)
    `)
    .eq('id', user.id)
    .single()

  return profile as ProfileWithDetails | null
}

// Get user profile by ID (respects RLS)
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return profile
}

// Check if current user can manage content from a specific country
export async function canManageCountry(countryId: string): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  if (!profile) return false

  // Admin can manage all countries
  if (profile.role === 'admin') return true
  
  // Member can only manage their own country
  if (profile.role === 'member') {
    return profile.country_id === countryId
  }

  return false
}

// Check if current user has specific role
export async function hasRole(role: UserRole): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  if (!profile) return false
  return profile.role === role
}

// Check if current user has any of the specified roles
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  if (!profile) return false
  return roles.includes(profile.role)
}

// Get countries accessible to current user
export async function getAccessibleCountries() {
  const profile = await getCurrentUserProfile()
  if (!profile) return []

  // All users (including admin) will see countries based on RLS
  // Admin sees all, users/members see only their own
  const supabase = createClient()
  const { data: countries } = await supabase
    .from('countries')
    .select('*')
    .order('name')
    
  return countries || []
}

// Get series for current user's country
export async function getAccessibleSeries() {
  const supabase = createClient()
  const { data: series } = await supabase
    .from('series')
    .select(`
      *,
      country:countries(*)
    `)
    .order('name')

  return series || []
}

// Get subjects with series associations for current user
export async function getAccessibleSubjects() {
  const supabase = createClient()
  const { data: subjects } = await supabase
    .from('subjects')
    .select(`
      *,
      series_subjects!inner(
        coefficient,
        series:series!inner(
          *,
          country:countries(*)
        )
      )
    `)
    .order('name')

  return subjects || []
}

// Create or update user profile
export async function upsertProfile(userId: string, profileData: {
  email: string
  full_name?: string
  country_id: string
  series_id?: string
  role?: UserRole
}) {
  const supabase = createClient()
  const { data, error } = await (supabase as any)
    .from('profiles')
    .upsert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

// Check if user exists and get their basic info
export async function checkUserExists(email: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  return !!data
}

// Get all profiles for admin/member management (respects RLS)
export async function getManageableProfiles() {
  const supabase = createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      *,
      country:countries(*),
      series:series(*)
    `)
    .eq('status', 'active') // Only show active users by default
    .order('created_at', { ascending: false })

  return profiles || []
}

// Get published courses (students see only published, members/admins see all)
export async function getAccessibleCourses() {
  const profile = await getCurrentUserProfile()
  if (!profile) return []

  const supabase = createClient()
  let query = supabase
    .from('courses')
    .select(`
      *,
      subject:subjects(*),
      tags:course_tags(
        tag:tags(*)
      ),
      created_by_profile:profiles(full_name, email)
    `)

  // Students only see published courses
  if (profile.role === 'user') {
    query = query.eq('status', 'publish')
  }

  const { data: courses } = await query.order('created_at', { ascending: false })
  return courses || []
}

// Update user status (admin only operation)
export async function updateUserStatus(userId: string, status: 'active' | 'suspended' | 'deleted') {
  const supabase = createClient()
  const { data, error } = await (supabase as any)
    .from('profiles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

// Update course status
export async function updateCourseStatus(courseId: string, status: 'draft' | 'publish' | 'archived') {
  const supabase = createClient()
  const { data, error } = await (supabase as any)
    .from('courses')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', courseId)
    .select()
    .single()

  return { data, error }
}
