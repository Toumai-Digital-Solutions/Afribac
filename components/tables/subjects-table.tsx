'use client'

import { DataTable } from '@/components/tables/data-table'
import { ServerFilteredDataTable } from '@/components/tables/server-filtered-data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { BookOpen, ExternalLink, Trash2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'

interface Subject {
  id: string
  name: string
  description: string | null
  created_at: string
  _count?: {
    series_subjects: number
  }
}

const columns: ColumnDef<Subject>[] = [
  {
    accessorKey: 'name',
    header: 'Nom de la matière',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-purple-600" />
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
    id: 'series_count',
    header: 'Séries associées',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original._count?.series_subjects || 0} série{(row.original._count?.series_subjects || 0) !== 1 ? 's' : ''}
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
          className="hover:bg-purple-50"
        >
          <Link href={`/dashboard/admin/subjects/${row.original.id}`} title="Voir les détails">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <DeleteConfirmationModal
          resourceType="subject"
          resourceName={row.original.name}
          resourceId={row.original.id}
          dependencies={{
            series: row.original._count?.series_subjects || 0
          }}
        />
      </div>
    ),
  },
]

interface SubjectsTableProps {
  data: Subject[]
  serverFiltered?: boolean
  currentSearchFilter?: string
}

export function SubjectsTable({ data, serverFiltered = false, currentSearchFilter }: SubjectsTableProps) {
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
      searchPlaceholder="Rechercher une matière..."
      filterable={false}
      pageSize={15}
    />
  )
}
