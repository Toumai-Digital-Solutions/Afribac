'use client'

import { DataTable } from '@/components/tables/data-table'
import { ServerFilteredDataTable } from '@/components/tables/server-filtered-data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { CountryModal } from '@/components/modals/country-modal'
import { Globe, ExternalLink, Trash2, Edit } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'

interface Country {
  id: string
  name: string
  code: string
  flag_url?: string
  is_supported?: boolean
  display_order?: number
  created_at: string
  _count?: {
    series: number
    profiles: number
  }
}

const columns: ColumnDef<Country>[] = [
  {
    accessorKey: 'display_order',
    header: 'Ordre',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.display_order || 0}
      </Badge>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Nom du pays',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.flag_url && (
          <span className="text-2xl">{row.original.flag_url}</span>
        )}
        <span className="font-medium">{row.getValue('name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue('code')}
      </Badge>
    ),
  },
  {
    accessorKey: 'is_supported',
    header: 'Statut',
    cell: ({ row }) => (
      row.original.is_supported ? (
        <Badge className="bg-green-500 hover:bg-green-600">
          Supporté
        </Badge>
      ) : (
        <Badge variant="secondary">
          Expansion
        </Badge>
      )
    ),
  },
  {
    id: 'series_count',
    header: 'Séries',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original._count?.series || 0} série{(row.original._count?.series || 0) !== 1 ? 's' : ''}
      </Badge>
    ),
  },
  {
    id: 'users_count',
    header: 'Utilisateurs',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original._count?.profiles || 0} utilisateur{(row.original._count?.profiles || 0) !== 1 ? 's' : ''}
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
          className="hover:bg-blue-50"
        >
          <Link href={`/dashboard/admin/countries/${row.original.id}`} title="Voir les détails">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <CountryModal
          mode="edit"
          initialData={{
            id: row.original.id,
            name: row.original.name,
            code: row.original.code,
            flag_url: row.original.flag_url,
            is_supported: row.original.is_supported,
            display_order: row.original.display_order
          }}
          trigger={
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-blue-50"
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </Button>
          }
        />
        <DeleteConfirmationModal
          resourceType="country"
          resourceName={row.original.name}
          resourceId={row.original.id}
          dependencies={{
            series: row.original._count?.series || 0,
            users: row.original._count?.profiles || 0
          }}
        />
      </div>
    ),
  },
]

interface CountriesTableProps {
  data: Country[]
  serverFiltered?: boolean
  currentSearchFilter?: string
}

export function CountriesTable({ data, serverFiltered = false, currentSearchFilter }: CountriesTableProps) {
  if (serverFiltered) {
    return (
      <ServerFilteredDataTable
        columns={columns}
        data={data}
        currentSearchFilter={currentSearchFilter}
        pageSize={15}
      />
    )
  }

  // Legacy mode
  return (
    <DataTable
      columns={columns}
      data={data}
      searchable
      searchPlaceholder="Rechercher un pays..."
      filterable={false}
      pageSize={15}
    />
  )
}
