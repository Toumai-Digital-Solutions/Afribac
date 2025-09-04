import { supabase } from './supabase'
import { getCurrentUserProfile } from './database'
import type { Course, Profile } from '@/types/database'

// Get all members from the same country for collaboration
export async function getCountryCollaborators() {
  const profile = await getCurrentUserProfile()
  if (!profile || profile.role !== 'member') return []

  const { data: collaborators } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, created_at')
    .eq('country_id', profile.country_id)
    .eq('role', 'member')
    .eq('status', 'active')
    .order('full_name')

  return collaborators || []
}

// Get all courses that can be collaboratively edited
export async function getCollaborativeCourses() {
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      subject:subjects(*),
      created_by_profile:profiles(full_name, email, avatar_url)
    `)
    .order('updated_at', { ascending: false })

  return courses || []
}

// Get course edit history (track who edited what)
export async function getCourseEditHistory(courseId: string) {
  // This would require an audit log table in the future
  // For now, we can track basic info from the course record
  const { data: course } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      updated_at,
      created_by,
      created_by_profile:profiles(full_name, email)
    `)
    .eq('id', courseId)
    .single()

  return course
}

// Check if current user can collaborate on a specific course
export async function canCollaborateOnCourse(courseId: string): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  if (!profile) return false

  // Admin can edit any course
  if (profile.role === 'admin') return true

  // Members can edit courses from their country (RLS will handle filtering)
  if (profile.role === 'member') {
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single()

    // If we can see the course, we can collaborate on it (thanks to RLS)
    return !!course
  }

  return false
}

// Get collaborative statistics for members
export async function getCollaborationStats() {
  const profile = await getCurrentUserProfile()
  if (!profile || profile.role !== 'member') return null

  const [coursesResult, collaboratorsResult] = await Promise.all([
    // Total courses in their country
    supabase
      .from('courses')
      .select('id, created_by', { count: 'exact' })
      .neq('status', 'archived'),
    
    // Active collaborators in their country  
    supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('country_id', profile.country_id)
      .eq('role', 'member')
      .eq('status', 'active')
  ])

  const totalCourses = coursesResult.count || 0
  const myCreatedCourses = coursesResult.data?.filter((c: any) => c.created_by === profile.id).length || 0
  const collaboratorCourses = totalCourses - myCreatedCourses
  const totalCollaborators = (collaboratorsResult.count || 0) - 1 // Exclude self

  return {
    totalCourses,
    myCreatedCourses,
    collaboratorCourses,
    totalCollaborators,
    collaborationRate: totalCourses > 0 ? (collaboratorCourses / totalCourses) * 100 : 0
  }
}
