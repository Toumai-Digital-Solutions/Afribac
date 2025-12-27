import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, FileText, Plus, Brain } from 'lucide-react'
import { QuizExercisesTableWrapper } from '@/components/tables/quiz-exercises-table-wrapper'
import { QuizExercisesFilters } from '@/components/forms/quiz-exercises-filters'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface QuizPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

// Get quiz & exercises data
async function getQuizExercisesData(filters: {
  search?: string
  content_type?: string
  subject_id?: string
  series_id?: string
  course_id?: string
  status?: string
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('quiz_exercise_details')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters.content_type) {
    query = query.eq('content_type', filters.content_type)
  }

  if (filters.subject_id) {
    query = query.eq('subject_id', filters.subject_id)
  }

  if (filters.series_id) {
    query = query.eq('series_id', filters.series_id)
  }

  if (filters.course_id) {
    if (filters.course_id === 'none') {
      query = query.is('course_id', null)
    } else {
      query = query.eq('course_id', filters.course_id)
    }
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  // Pagination
  const page = filters.page || 1
  const limit = filters.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to).order('updated_at', { ascending: false })

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching quiz/exercises:', error)
    return { items: [], total: 0 }
  }

  return { items: data || [], total: count || 0 }
}

// Get filter options
async function getFilterOptions() {
  const supabase = await createClient()

  const [
    { data: subjects },
    { data: series },
    { data: courses }
  ] = await Promise.all([
    supabase.from('subjects').select('id, name, color').order('name'),
    supabase.from('series').select(`
      id,
      name,
      countries!inner(name)
    `).order('name'),
    supabase.from('courses').select('id, title').order('title')
  ])

  return {
    subjects: subjects || [],
    series: (series || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      countries: s.countries ? { name: s.countries.name } : undefined
    })),
    courses: courses || []
  }
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const supabase = await createClient()
  
  // Check authentication and permissions
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/signin')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !['member', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Extract search params
  const search = searchParams.search as string || ''
  const content_type = searchParams.content_type as string || ''
  const subject_id = searchParams.subject_id as string || ''
  const series_id = searchParams.series_id as string || ''
  const course_id = searchParams.course_id as string || ''
  const status = searchParams.status as string || ''
  const page = parseInt(searchParams.page as string) || 1

  // Fetch data
  const [{ items, total }, filterOptions] = await Promise.all([
    getQuizExercisesData({ search, content_type, subject_id, series_id, course_id, status, page }),
    getFilterOptions()
  ])

  const quizzes = items.filter(item => item.content_type === 'quiz')
  const exercises = items.filter(item => item.content_type === 'exercise')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz & Exercices</h1>
          <p className="text-muted-foreground">
            Créez des quiz interactifs et des exercices avec solutions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/dashboard/content/quiz/new?type=exercise">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Nouvel Exercice
            </Button>
          </Link>
          <Link href="/dashboard/content/quiz/new?type=quiz">
            <Button>
              <Brain className="h-4 w-4 mr-2" />
              Nouveau Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              Quiz & exercices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
            <p className="text-xs text-muted-foreground">
              Interactifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercices</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.length}</div>
            <p className="text-xs text-muted-foreground">
              Avec solutions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiés</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {items.filter(item => item.status === 'published').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Accessibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <QuizExercisesFilters
        search={search}
        content_type={content_type}
        subject_id={subject_id}
        series_id={series_id}
        course_id={course_id}
        status={status}
        subjects={filterOptions.subjects as any}
        series={filterOptions.series as any}
        courses={filterOptions.courses as any}
      />

      {/* Table */}
      <Card>
        <CardContent className="p-3">
          <Suspense fallback={<div className="p-6">Chargement...</div>}>
            <QuizExercisesTableWrapper
              data={items}
              totalCount={total}
              currentPage={page}
              pageSize={20}
              searchQuery={search}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
