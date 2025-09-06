'use client'

import { DataTable } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { 
  BookOpen, 
  ExternalLink, 
  Trash2, 
  Edit, 
  Eye, 
  Clock, 
  Users,
  FileText,
  Play
} from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { CourseWithDetails } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Course {
  id: string
  title: string
  description: string | null
  subject_id: string
  subject_name: string
  subject_color: string
  subject_icon: string
  difficulty_level: number
  estimated_duration: number
  status: 'draft' | 'publish' | 'archived'
  view_count: number
  author_name: string | null
  series_names: string[]
  country_names: string[]
  tag_names: string[]
  created_at: string
  updated_at: string
}

const getDifficultyLabel = (level: number) => {
  switch (level) {
    case 1: return { label: 'Débutant', color: 'bg-green-100 text-green-800' }
    case 2: return { label: 'Facile', color: 'bg-blue-100 text-blue-800' }
    case 3: return { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' }
    case 4: return { label: 'Difficile', color: 'bg-orange-100 text-orange-800' }
    case 5: return { label: 'Expert', color: 'bg-red-100 text-red-800' }
    default: return { label: 'Non défini', color: 'bg-gray-100 text-gray-800' }
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'publish':
      return <Badge className="bg-green-100 text-green-800">Publié</Badge>
    case 'draft':
      return <Badge className="bg-yellow-100 text-yellow-800">Brouillon</Badge>
    case 'archived':
      return <Badge className="bg-gray-100 text-gray-800">Archivé</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const columns: ColumnDef<Course>[] = [
  {
    accessorKey: 'title',
    header: 'Cours',
    cell: ({ row }) => (
      <div className="flex items-start gap-3 min-w-0">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: row.original.subject_color }}
        >
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate" title={row.getValue('title')}>
            {row.getValue('title')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <span className="font-medium">{row.original.subject_name}</span>
            {row.original.author_name && (
              <span> • Par {row.original.author_name}</span>
            )}
          </div>
          {row.original.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={row.original.description}>
              {row.original.description}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    id: 'series_countries',
    header: 'Disponibilité',
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="flex flex-wrap gap-1">
          {row.original.series_names.length > 0 ? (
            row.original.series_names.slice(0, 2).map((series) => (
              <Badge key={series} variant="outline" className="text-xs">
                {series}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Aucune série
            </Badge>
          )}
          {row.original.series_names.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.series_names.length - 2}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {row.original.country_names.length > 0 ? (
            row.original.country_names.slice(0, 2).map((country) => (
              <span key={country} className="text-xs text-muted-foreground">
                {country}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">Tous pays</span>
          )}
          {row.original.country_names.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{row.original.country_names.length - 2}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    id: 'metadata',
    header: 'Détails',
    cell: ({ row }) => {
      const difficulty = getDifficultyLabel(row.original.difficulty_level)
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {row.original.estimated_duration}min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {row.original.view_count} vues
            </span>
          </div>
          <Badge className={`text-xs ${difficulty.color}`}>
            {difficulty.label}
          </Badge>
        </div>
      )
    },
  },
  {
    id: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {getStatusBadge(row.original.status)}
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.updated_at), { 
            addSuffix: true, 
            locale: fr 
          })}
        </span>
      </div>
    ),
  },
  {
    id: 'tags',
    header: 'Tags',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1 max-w-32">
        {row.original.tag_names.length > 0 ? (
          <>
            {row.original.tag_names.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {row.original.tag_names.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{row.original.tag_names.length - 2}
              </Badge>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">Aucun tag</span>
        )}
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Link href={`/dashboard/admin/courses/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
            <span className="sr-only">Voir le cours</span>
          </Button>
        </Link>
        <Link href={`/dashboard/content/courses/${row.original.id}/edit`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Modifier le cours</span>
          </Button>
        </Link>
        {row.original.status === 'publish' && (
          <Link href={`/courses/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Voir publiquement</span>
            </Button>
          </Link>
        )}
        <DeleteConfirmationModal
          title="Supprimer le cours"
          description="Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible."
          onConfirm={() => {
            // TODO: Implement delete functionality
            console.log('Delete course:', row.original.id)
          }}
          trigger={
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Supprimer le cours</span>
            </Button>
          }
        />
      </div>
    ),
  },
]

interface CoursesTableProps {
  courses: Course[]
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onFilter: (filters: Record<string, any>) => void
  searchQuery?: string
  filters?: Record<string, any>
}

export function CoursesTable({
  courses,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onSearch,
  onFilter,
  searchQuery = '',
  filters = {},
}: CoursesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={courses}
      searchKey="title"
      searchPlaceholder="Rechercher des cours..."
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onSearch={onSearch}
      searchQuery={searchQuery}
    />
  )
}
