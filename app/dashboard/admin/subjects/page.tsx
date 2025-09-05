import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubjectsTable } from '@/components/tables/subjects-table'
import { SubjectModal } from '@/components/modals/subject-modal'
import { FilterHeader } from '@/components/ui/filter-header'
import { BookOpen } from 'lucide-react'

interface SubjectsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function SubjectsPage({ searchParams }: SubjectsPageProps) {
  const supabase = await createClient()
  
  // Get the current user and check permissions
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Extract search params
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined

  // Build query with server-side filtering
  let query = supabase
    .from('subjects')
    .select(`
      *,
      series_subjects(count)
    `)

  // Apply search filter server-side
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Execute query with ordering
  const { data: subjects } = await query.order('name')

  // Transform data for the table
  const tableData = subjects?.map(subject => ({
    ...subject,
    _count: {
      series_subjects: subject.series_subjects?.length || 0,
    }
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <FilterHeader
        title="Gestion des matières"
        description="Gérez les matières et leurs associations avec les séries"
        icon={<BookOpen className="h-6 w-6 text-purple-600" />}
        searchFilter={search ? {
          value: search,
          clearUrl: '/dashboard/admin/subjects'
        } : undefined}
      >
        <SubjectModal mode="create" />
      </FilterHeader>

      {/* Subjects Table */}
      <SubjectsTable data={tableData} serverFiltered={true} currentSearchFilter={search} />
    </div>
  )
}
