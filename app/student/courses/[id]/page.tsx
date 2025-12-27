import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CourseDetailClient } from '@/components/student/course-detail-client'

export default async function StudentCourseDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) redirect('/auth/signin')

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      content,
      content_json,
      pdf_url,
      pdf_filename,
      video_url,
      estimated_duration,
      difficulty_level,
      subject:subjects(name, color),
      topic:topics(name)
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (courseError || !course) {
    notFound()
  }

  const { data: progress } = await supabase
    .from('user_progress')
    .select('completion_percentage, time_spent, last_accessed, is_completed, bookmarks')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()

  return (
    <CourseDetailClient
      course={{
        id: course.id,
        title: course.title,
        description: course.description,
        content: course.content,
        contentJson: (course as any).content_json ?? null,
        pdfUrl: course.pdf_url,
        pdfFilename: course.pdf_filename,
        videoUrl: course.video_url,
        estimatedDuration: course.estimated_duration,
        difficultyLevel: course.difficulty_level,
        subjectName: (course as any).subject?.name ?? null,
        subjectColor: (course as any).subject?.color ?? null,
        topicName: (course as any).topic?.name ?? null,
      }}
      initialProgress={{
        completionPercentage: progress?.completion_percentage ?? 0,
        timeSpentMinutes: progress?.time_spent ?? 0,
        lastAccessed: progress?.last_accessed ?? null,
        isCompleted: progress?.is_completed ?? false,
        bookmarks: Array.isArray(progress?.bookmarks) ? (progress?.bookmarks as number[]) : [],
      }}
    />
  )
}

