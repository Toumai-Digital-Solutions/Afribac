import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SeriesTable } from '@/components/tables/series-table'
import { SeriesModal } from '@/components/modals/series-modal'
import { FilterHeader } from '@/components/ui/filter-header'
import { FileText } from 'lucide-react'

interface SeriesPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
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
  const country = typeof searchParams.country === 'string' ? searchParams.country : undefined

  // Build query with server-side filtering
  let query = supabase
    .from('series')
    .select(`
      *,
      country:countries(*),
      profiles(count),
      series_subjects(count)
    `)

  // Apply country filter server-side
  if (country) {
    query = query.eq('country_id', country)
  }

  // Apply search filter server-side
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Execute query with ordering
  const { data: series } = await query.order('created_at', { ascending: false })

  // Transform data for the table
  const tableData = series?.map(serie => ({
    ...serie,
    _count: {
      profiles: serie.profiles?.length || 0,
      series_subjects: serie.series_subjects?.length || 0,
    }
  })) || []


  // Get countries for filter
  const { data: countries } = await supabase
    .from('countries')
    .select('id, name, code')
    .order('name')

  const filterOptions = countries?.map(country => ({
    label: `${country.name} (${country.code})`,
    value: country.id
  })) || []

  // Find selected country for display
  const selectedCountry = country ? countries?.find(c => c.id === country) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <FilterHeader
        title="Gestion des séries"
        description="Gérez les séries par pays et leurs matières"
        icon={<FileText className="h-6 w-6 text-green-600" />}
        searchFilter={search ? {
          value: search,
          clearUrl: '/dashboard/admin/series'
        } : undefined}
        countryFilter={selectedCountry ? {
          value: selectedCountry.name,
          clearUrl: '/dashboard/admin/series'
        } : undefined}
      >
        <SeriesModal mode="create" />
      </FilterHeader>

      {/* Series Table */}
      <SeriesTable 
        data={tableData} 
        filterOptions={filterOptions} 
        serverFiltered={true}
        currentCountryFilter={country}
        currentSearchFilter={search}
      />
    </div>
  )
}
