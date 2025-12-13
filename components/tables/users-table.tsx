'use client'

import { ServerFilteredDataTable } from '@/components/tables/server-filtered-data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { Users, ExternalLink, Calendar, Mail, Globe, GraduationCap } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { UserModal } from '@/components/modals/user-modal'
import { UserAdminActions } from '@/components/admin/user-admin-actions'

interface User {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'member' | 'admin'
  country_id: string | null
  series_id: string | null
  avatar_url: string | null
  phone: string | null
  date_of_birth: string | null
  status: 'active' | 'suspended' | 'deleted'
  created_at: string
  updated_at: string
  country: {
    id: string
    name: string
    code: string
  } | null
  series?: {
    id: string
    name: string
    description: string | null
    country: {
      id: string
      name: string
      code: string
    }
  } | null
  _count?: {
    // Add any counts if needed
  }
}

const getRoleConfig = (role: string) => {
  switch (role) {
    case 'admin':
      return {
        label: 'Administrateur',
        variant: 'destructive' as const,
        icon: <Users className="h-3 w-3" />
      }
    case 'member':
      return {
        label: 'Membre',
        variant: 'default' as const,
        icon: <Users className="h-3 w-3" />
      }
    case 'user':
      return {
        label: 'Étudiant',
        variant: 'secondary' as const,
        icon: <GraduationCap className="h-3 w-3" />
      }
    default:
      return {
        label: role,
        variant: 'outline' as const,
        icon: <Users className="h-3 w-3" />
      }
  }
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return {
        label: 'Actif',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200'
      }
    case 'suspended':
      return {
        label: 'Suspendu',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    case 'deleted':
      return {
        label: 'Supprimé',
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-600 border-gray-200'
      }
    default:
      return {
        label: status,
        variant: 'outline' as const,
        className: ''
      }
  }
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'full_name',
    header: 'Utilisateur',
    cell: ({ row }) => {
      const user = row.original
      const roleConfig = getRoleConfig(user.role)

      return (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {user.full_name || 'Nom non défini'}
              </span>
              <Badge variant={roleConfig.variant} className="text-xs flex items-center gap-1">
                {roleConfig.icon}
                {roleConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 truncate">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'country_id',
    header: 'Pays',
    cell: ({ row }) => {
      const country = row.original.country

      if (!country) {
        return (
          <span className="text-gray-400 text-sm italic">
            Non défini
          </span>
        )
      }

      return (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" />
          <div>
            <span className="font-medium">{country.name}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {country.code}
            </Badge>
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return row.getValue(id) === value
    },
  },
  {
    accessorKey: 'series',
    header: 'Série',
    cell: ({ row }) => {
      const series = row.original.series
      if (!series) {
        return (
          <span className="text-gray-400 text-sm">
            {row.original.role === 'user' ? 'Non assignée' : 'Non applicable'}
          </span>
        )
      }
      return (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-green-600" />
          <div>
            <span className="font-medium">{series.name}</span>
            {series.description && (
              <p className="text-xs text-gray-500 truncate max-w-32">
                {series.description}
              </p>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const statusConfig = getStatusConfig(row.original.status)
      return (
        <Badge variant={statusConfig.variant} className={statusConfig.className}>
          {statusConfig.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Date d\'inscription',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span>
          {new Date(row.original.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          asChild
        >
          <Link href={`/dashboard/admin/users/${row.original.id}`} title="Voir les détails">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <UserModal mode="edit" initialData={row.original as any} />
        <UserAdminActions
          userId={row.original.id}
          userEmail={row.original.email}
          currentStatus={row.original.status}
          onDone={() => {}}
        />
        <DeleteConfirmationModal
          resourceType="user"
          resourceName={row.original.full_name || row.original.email}
          resourceId={row.original.id}
          dependencies={{}}
        />
      </div>
    ),
  },
]

interface UsersTableProps {
  data: User[]
  roleOptions?: { label: string; value: string }[]
  countryOptions?: { label: string; value: string }[]
  serverFiltered?: boolean
  currentRoleFilter?: string
  currentCountryFilter?: string
  currentSearchFilter?: string
}

export function UsersTable({
  data,
  roleOptions = [],
  countryOptions = [],
  serverFiltered = false,
  currentRoleFilter,
  currentCountryFilter,
  currentSearchFilter
}: UsersTableProps) {
  if (serverFiltered) {
    return (
      <ServerFilteredDataTable
        columns={columns}
        data={data}
        filterOptions={countryOptions}
        roleOptions={roleOptions}
        currentCountryFilter={currentCountryFilter}
        currentRoleFilter={currentRoleFilter}
        currentSearchFilter={currentSearchFilter}
        pageSize={20}
      />
    )
  }

  // Legacy mode (not implemented for users)
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>Mode client non disponible pour les utilisateurs</p>
    </div>
  )
}
