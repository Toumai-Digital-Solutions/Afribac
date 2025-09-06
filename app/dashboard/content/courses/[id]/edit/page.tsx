import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CourseEditor } from '@/components/forms/course-editor'

interface EditCoursePageProps {
  params: {
    id: string
  }
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/signin')
  }

  // Check if user has permission to edit courses
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !['member', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch the course with all related data
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(`
      *,
      subject:subjects(id, name, color, icon),
      created_by_profile:profiles(full_name),
      course_series!inner(
        series_id,
        series:series(
          id,
          name,
          countries(name)
        )
      ),
      course_tags(
        tag_id,
        tags(id, name, type, color)
      )
    `)
    .eq('id', params.id)
    .single()

  if (courseError || !course) {
    notFound()
  }

  // Check if user can edit this course (admin can edit all, members can edit their own)
  if (profile.role !== 'admin' && course.created_by !== user.id) {
    redirect('/dashboard/content/courses')
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier le cours</h1>
        <p className="text-muted-foreground">
          Modifiez "{course.title}" avec sauvegarde automatique.
        </p>
      </div>
      
      <CourseEditor mode="edit" initialData={course} />
    </div>
  )
}
