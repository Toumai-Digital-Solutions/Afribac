'use client'

import { DataTable } from '@/components/tables/data-table'
import { ServerFilteredDataTable } from '@/components/tables/server-filtered-data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { FileText, ExternalLink, Trash2, Globe } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'

interface Series {
  id: string
  name: string
  description: string | null
  country_id: string
  country: {
    name: string
    code: string
  }
  created_at: string
  _count?: {
    profiles: number
    series_subjects: number
  }
}

const columns: ColumnDef<Series>[] = [
  {
    accessorKey: 'name',
    header: 'Nom de la série',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-green-600" />
        <div>
          <span className="font-medium">{row.getValue('name')}</span>
          {row.original.description && (
            <p className="text-xs text-muted-foreground">{row.original.description}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'country_id',
    header: 'Pays',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-blue-600" />
        <div>
          <span className="font-medium">{row.original.country.name}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {row.original.country.code}
          </Badge>
        </div>
      </div>
    ),
    filterFn: (row, id, value) => {
      return row.getValue(id) === value
    },
  },
  {
    id: 'subjects_count',
    header: 'Matières',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original._count?.series_subjects || 0} matière{(row.original._count?.series_subjects || 0) !== 1 ? 's' : ''}
      </Badge>
    ),
  },
  {
    id: 'students_count',
    header: 'Étudiants',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original._count?.profiles || 0} étudiant{(row.original._count?.profiles || 0) !== 1 ? 's' : ''}
      </Badge>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Créé le',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.getValue('created_at')).toLocaleDateString('fr-FR')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="hover:bg-green-50"
        >
          <Link href={`/dashboard/admin/series/${row.original.id}`} title="Voir les détails">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <DeleteConfirmationModal
          resourceType="series"
          resourceName={row.original.name}
          resourceId={row.original.id}
          dependencies={{
            subjects: row.original._count?.series_subjects || 0,
            users: row.original._count?.profiles || 0
          }}
        />
      </div>
    ),
  },
]

interface SeriesTableProps {
  data: Series[]
  filterOptions?: { label: string; value: string }[]
  serverFiltered?: boolean
  currentCountryFilter?: string
  currentSearchFilter?: string
}

export function SeriesTable({ 
  data, 
  filterOptions = [], 
  serverFiltered = false,
  currentCountryFilter,
  currentSearchFilter
}: SeriesTableProps) {
  if (serverFiltered) {
    // Server-filtered mode - simpler table without client-side filtering
    return (
      <ServerFilteredDataTable
        columns={columns}
        data={data}
        filterOptions={filterOptions}
        currentCountryFilter={currentCountryFilter}
        currentSearchFilter={currentSearchFilter}
        pageSize={15}
      />
    )
  }

  // Legacy client-side filtering (keeping for backward compatibility)
  return (
    <DataTable
      columns={columns}
      data={data}
      searchable
      searchPlaceholder="Rechercher une série..."
      filterable
      filterColumn="country_id"
      filterOptions={filterOptions}
      pageSize={15}
    />
  )
}
