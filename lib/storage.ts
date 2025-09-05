import { createClient } from './supabase'
import { getCurrentUserProfile } from './database'

const supabase = createClient()

// Upload course material with country-based path structure
export async function uploadCourseMaterial(
  file: File, 
  courseId: string,
  subjectName: string
): Promise<{ url?: string; error?: string }> {
  try {
    const profile = await getCurrentUserProfile()
    if (!profile) {
      return { error: 'User not authenticated' }
    }

    // Get country code for path structure
    const countryCode = profile.country?.code
    if (!countryCode) {
      return { error: 'User country not found' }
    }

    // Create path: country_code/subject/course_id/filename
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const subjectSlug = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const filePath = `${countryCode}/${subjectSlug}/${courseId}/${fileName}`

    // Upload file
    const { data, error } = await supabase.storage
      .from('course-materials')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('course-materials')
      .getPublicUrl(filePath)

    return { url: publicUrl }
  } catch (error) {
    return { error: 'Upload failed' }
  }
}

// Delete course material
export async function deleteCourseMaterial(filePath: string): Promise<{ error?: string }> {
  const { error } = await supabase.storage
    .from('course-materials')
    .remove([filePath])

  if (error) {
    return { error: error.message }
  }

  return {}
}

// List materials for a specific course (respects RLS)
export async function listCourseMaterials(courseId: string) {
  const { data, error } = await supabase.storage
    .from('course-materials')
    .list('', {
      limit: 100,
      offset: 0,
      search: courseId
    })

  return { data: data || [], error }
}

// Get materials accessible to current user (respects country-based RLS)
export async function getAccessibleMaterials() {
  const profile = await getCurrentUserProfile()
  if (!profile) return []

  // For members and users, get materials from their country
  // For admin, get all materials
  let searchPath = ''
  
  if (profile.role !== 'admin' && profile.country?.code) {
    searchPath = profile.country.code
  }

  const { data } = await supabase.storage
    .from('course-materials')
    .list(searchPath, {
      limit: 1000,
      offset: 0
    })

  return data || []
}

// Helper to extract country code from storage path
export function getCountryFromPath(path: string): string | null {
  const pathParts = path.split('/')
  return pathParts.length > 0 ? pathParts[0] : null
}

// Helper to generate storage path for a course
export async function generateCoursePath(courseId: string, fileName: string): Promise<string | null> {
  const profile = await getCurrentUserProfile()
  if (!profile?.country?.code) return null

  // Get course details to determine subject
  const { data: course } = await supabase
    .from('courses')
    .select('subject:subjects(name)')
    .eq('id', courseId)
    .single<any>()

  if (!course || !course.subject || !course.subject.name) return null

  const subjectSlug = course.subject.name.toLowerCase().replace(/\s+/g, '-')
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${profile.country.code}/${subjectSlug}/${courseId}/${Date.now()}-${cleanFileName}`
}
