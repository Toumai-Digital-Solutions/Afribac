import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { CoursesTableWrapper } from '@/components/tables/courses-table-wrapper'
import { CourseModal } from '@/components/modals/course-modal'
import { CoursesFilters } from '@/components/forms/courses-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

interface CoursesPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

// Course query function with filters
async function getCourses(filters: {
  search?: string
  country_id?: string
  subject_id?: string
  series_id?: string
  status?: string
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  
  // Use the courses table with joins (fallback while migration is pending)
  let query = supabase
    .from('courses')
    .select(`
      *,
      subject:subjects(name, color, icon),
      created_by_profile:profiles(full_name)
    `, { count: 'exact' })

  // Apply filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters.subject_id) {
    query = query.eq('subject_id', filters.subject_id)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  // For now, skip country and series filters until migration is applied
  // TODO: Implement these filters after applying the course_series migration
  if (filters.country_id) {
    // This will be re-enabled after migration
    console.log('Country filter temporarily disabled')
  }

  if (filters.series_id) {
    // This will be re-enabled after migration
    console.log('Series filter temporarily disabled')
  }

  // Pagination
  const page = filters.page || 1
  const limit = filters.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to).order('updated_at', { ascending: false })

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching courses:', error)
    return { courses: [], total: 0 }
  }

  // Transform the data to match expected format
  const transformedCourses = (data || []).map(course => ({
    ...course,
    subject_name: course.subject?.name || 'Unknown',
    subject_color: course.subject?.color || '#3B82F6',
    subject_icon: course.subject?.icon || 'book',
    author_name: course.created_by_profile?.full_name || null,
    series_names: [], // Will be populated after migration
    country_names: [], // Will be populated after migration
    tag_names: [], // Will be populated after migration
  }))

  return { courses: transformedCourses, total: count || 0 }
}

// Get filter options
async function getFilterOptions() {
  const supabase = await createClient()

  const [
    { data: countries },
    { data: subjects },
    { data: series }
  ] = await Promise.all([
    supabase.from('countries').select('id, name').order('name'),
    supabase.from('subjects').select('id, name, color').order('name'),
    supabase.from('series').select(`
      id, 
      name, 
      country_id,
      countries!inner(name)
    `).order('name')
  ])

  return {
    countries: countries || [],
    subjects: subjects || [],
    series: (series || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      countries: s.countries ? { name: s.countries.name } : undefined
    }))
  }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  // Extract search params
  const search = searchParams.search as string || ''
  const country_id = searchParams.country_id as string || ''
  const subject_id = searchParams.subject_id as string || ''
  const series_id = searchParams.series_id as string || ''
  const status = searchParams.status as string || ''
  const page = parseInt(searchParams.page as string) || 1

  // Fetch data
  const [{ courses, total }, filterOptions] = await Promise.all([
    getCourses({ search, country_id, subject_id, series_id, status, page }),
    getFilterOptions()
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des cours</h1>
          <p className="text-muted-foreground">
            Créez et gérez les cours disponibles sur la plateforme
          </p>
        </div>
        <CourseModal mode="create" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiés</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.status === 'publish').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.status === 'draft').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matières</CardTitle>
            <div className="h-2 w-2 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(courses.map(c => c.subject_name)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <CoursesFilters
        search={search}
        subject_id={subject_id}
        country_id={country_id}
        series_id={series_id}
        status={status}
        subjects={filterOptions.subjects}
        countries={filterOptions.countries}
        series={filterOptions.series}
      />

      {/* Table */}
      <Card>
        <CardContent className="p-3">
          <Suspense fallback={<div className="p-6">Chargement...</div>}>
            <CoursesTableWrapper
              courses={courses}
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
