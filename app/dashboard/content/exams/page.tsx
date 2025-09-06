import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ExamsTable } from '@/components/tables/exams-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Plus, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ExamsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

// Exam query function with filters
async function getExams(filters: {
  search?: string
  subject_id?: string
  series_id?: string
  exam_type?: string
  status?: string
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('exam_details')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters.subject_id) {
    query = query.eq('subject_id', filters.subject_id)
  }

  if (filters.series_id) {
    query = query.eq('series_id', filters.series_id)
  }

  if (filters.exam_type) {
    query = query.eq('exam_type', filters.exam_type)
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
    console.error('Error fetching exams:', error)
    return { exams: [], total: 0 }
  }

  return { exams: data || [], total: count || 0 }
}

// Get filter options
async function getFilterOptions() {
  const supabase = await createClient()

  const [
    { data: subjects },
    { data: series }
  ] = await Promise.all([
    supabase.from('subjects').select('id, name, color').order('name'),
    supabase.from('series').select(`
      id, 
      name, 
      country_id,
      countries(name)
    `).order('name')
  ])

  return {
    subjects: subjects || [],
    series: (series || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      countries: s.countries ? { name: s.countries.name } : undefined
    }))
  }
}

const examTypeLabels = {
  'baccalaureat': 'Baccalauréat',
  'school_exam': 'Examen scolaire',
  'mock_exam': 'Examen blanc',
  'practice_test': 'Test d\'entraînement',
  'other': 'Autre'
}

export default async function ExamsPage({ searchParams }: ExamsPageProps) {
  // Extract search params
  const search = searchParams.search as string || ''
  const subject_id = searchParams.subject_id as string || ''
  const series_id = searchParams.series_id as string || ''
  const exam_type = searchParams.exam_type as string || ''
  const status = searchParams.status as string || ''
  const page = parseInt(searchParams.page as string) || 1

  // Fetch data
  const [{ exams, total }, filterOptions] = await Promise.all([
    getExams({ search, subject_id, series_id, exam_type, status, page }),
    getFilterOptions()
  ])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des examens</h1>
          <p className="text-muted-foreground">
            Créez et gérez les examens avec questions et corrections
          </p>
        </div>
        
        <Link href="/dashboard/content/exams/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Créer un examen
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total examens</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baccalauréat</CardTitle>
            <div className="h-2 w-2 bg-purple-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.filter(e => e.exam_type === 'baccalaureat').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Examens scolaires</CardTitle>
            <div className="h-2 w-2 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.filter(e => e.exam_type === 'school_exam').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiés</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exams.filter(e => e.status === 'published').length}
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
              {exams.filter(e => e.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-4">
          <Suspense fallback={<div className="p-6">Chargement...</div>}>
            <ExamsTable
              exams={exams}
              totalCount={total}
              currentPage={page}
              pageSize={20}
              searchQuery={search}
              filters={{ subject_id, series_id, exam_type, status }}
              filterOptions={filterOptions}
              examTypeLabels={examTypeLabels}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
