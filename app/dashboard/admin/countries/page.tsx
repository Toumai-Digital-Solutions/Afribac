import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CountriesTable } from '@/components/tables/countries-table'
import { CountryModal } from '@/components/modals/country-modal'
import { FilterHeader } from '@/components/ui/filter-header'
import { Globe } from 'lucide-react'

interface CountriesPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function CountriesPage({ searchParams }: CountriesPageProps) {
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
    .from('countries')
    .select(`
      *,
      series(count),
      profiles(count)
    `)

  // Apply search filter server-side
  if (search) {
    query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)
  }

  // Execute query with ordering
  const { data: countries } = await query.order('name')

  // Transform data for the table
  const tableData = countries?.map(country => ({
    ...country,
    _count: {
      series: country.series?.length || 0,
      profiles: country.profiles?.length || 0,
    }
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <FilterHeader
        title="Gestion des pays"
        description="Gérez les pays et leurs configurations"
        icon={<Globe className="h-6 w-6 text-blue-600" />}
        searchFilter={search ? {
          value: search,
          clearUrl: '/dashboard/admin/countries'
        } : undefined}
      >
        <CountryModal mode="create" />
      </FilterHeader>

      {/* Countries Table */}
      <CountriesTable data={tableData} serverFiltered={true} currentSearchFilter={search} />
    </div>
  )
}
