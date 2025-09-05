import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FilterHeader } from '@/components/ui/filter-header'
import { UsersTable } from '@/components/tables/users-table'
import { UserModal } from '@/components/modals/user-modal'
import { Users, UserPlus } from 'lucide-react'

interface UsersPageProps {
  searchParams: {
    search?: string
    role?: string
    country?: string
  }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const supabase = await createClient()

  // Check authentication and role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/signin')
  }

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
  const role = typeof searchParams.role === 'string' ? searchParams.role : undefined
  const country = typeof searchParams.country === 'string' ? searchParams.country : undefined

  // Build query with server-side filtering
  let query = supabase
    .from('profiles')
    .select(`
      *,
      country:countries(*),
      series:series(*, country:countries(*))
    `)

  // Apply role filter server-side
  if (role && role !== 'all') {
    query = query.eq('role', role)
  }

  // Apply country filter server-side
  if (country) {
    query = query.eq('country_id', country)
  }

  // Apply search filter server-side
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  // Execute query with ordering
  const { data: users } = await query.order('created_at', { ascending: false })

  // Get countries for filter options
  const { data: countries } = await supabase
    .from('countries')
    .select('id, name, code')
    .order('name')

  // Transform data for the table
  const tableData = users?.map(user => ({
    ...user,
    _count: {
      // Add any counts if needed
    }
  })) || []

  // Prepare filter options
  const countryOptions = countries?.map(c => ({
    label: `${c.name} (${c.code})`,
    value: c.id
  })) || []

  const roleOptions = [
    { label: 'Étudiants', value: 'user' },
    { label: 'Membres', value: 'member' },
    { label: 'Administrateurs', value: 'admin' }
  ]

  // Find selected country for display
  const selectedCountry = country ? countries?.find(c => c.id === country) : null

  return (
    <>
      <title>Gestion des utilisateurs - Afribac</title>
      
      <div className="space-y-6">
        <FilterHeader
          title="Gestion des utilisateurs"
          description="Gérez les utilisateurs, leurs rôles et leurs informations"
          icon={<Users className="h-6 w-6 text-purple-600" />}
          searchFilter={search ? {
            value: search,
            clearUrl: '/dashboard/admin/users'
          } : undefined}
          roleFilter={role && role !== 'all' ? {
            value: roleOptions.find(r => r.value === role)?.label || role,
            clearUrl: '/dashboard/admin/users'
          } : undefined}
          countryFilter={selectedCountry ? {
            value: selectedCountry.name,
            clearUrl: '/dashboard/admin/users'
          } : undefined}
        >
          <UserModal 
            mode="create" 
            trigger={
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                <UserPlus className="h-4 w-4" />
                Nouvel utilisateur
              </button>
            }
          />
        </FilterHeader>

        {/* Users Table */}
        <UsersTable 
          data={tableData} 
          roleOptions={roleOptions}
          countryOptions={countryOptions}
          serverFiltered={true}
          currentRoleFilter={role}
          currentCountryFilter={country}
          currentSearchFilter={search}
        />
      </div>
    </>
  )
}
