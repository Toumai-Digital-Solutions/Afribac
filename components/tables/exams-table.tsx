'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { 
  BookOpen, 
  ExternalLink, 
  Trash2, 
  Edit, 
  Eye, 
  Clock, 
  Calendar,
  Award,
  FileText,
  Search,
  Filter
} from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Exam {
  id: string
  title: string
  description: string | null
  exam_type: 'baccalaureat' | 'school_exam' | 'mock_exam' | 'practice_test' | 'other'
  exam_year: number | null
  exam_session: string | null
  duration_minutes: number
  total_points: number | null
  subject_id: string
  subject_name: string
  subject_color: string
  subject_icon: string
  series_id: string
  series_name: string
  country_name: string
  status: 'draft' | 'published' | 'archived'
  difficulty_level: number
  view_count: number
  author_name: string | null
  tag_names: string[]
  created_at: string
  updated_at: string
}

const getDifficultyLabel = (level: number) => {
  switch (level) {
    case 1: return { label: 'Très facile', color: 'bg-green-100 text-green-800' }
    case 2: return { label: 'Facile', color: 'bg-blue-100 text-blue-800' }
    case 3: return { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' }
    case 4: return { label: 'Difficile', color: 'bg-orange-100 text-orange-800' }
    case 5: return { label: 'Très difficile', color: 'bg-red-100 text-red-800' }
    default: return { label: 'Non défini', color: 'bg-gray-100 text-gray-800' }
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-100 text-green-800">Publié</Badge>
    case 'draft':
      return <Badge className="bg-yellow-100 text-yellow-800">Brouillon</Badge>
    case 'archived':
      return <Badge className="bg-gray-100 text-gray-800">Archivé</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getExamTypeBadge = (type: string, typeLabels: Record<string, string>) => {
  const colors = {
    baccalaureat: 'bg-purple-100 text-purple-800',
    school_exam: 'bg-blue-100 text-blue-800',
    mock_exam: 'bg-orange-100 text-orange-800',
    practice_test: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800'
  }
  
  return (
    <Badge className={colors[type as keyof typeof colors] || colors.other}>
      {typeLabels[type] || type}
    </Badge>
  )
}

interface ExamsTableProps {
  exams: Exam[]
  totalCount: number
  currentPage: number
  pageSize: number
  searchQuery?: string
  filters?: Record<string, any>
  filterOptions: {
    subjects: Array<{ id: string; name: string; color: string }>
    series: Array<{ id: string; name: string; countries?: { name: string } }>
  }
  examTypeLabels: Record<string, string>
}

export function ExamsTable({
  exams,
  totalCount,
  currentPage,
  pageSize,
  searchQuery = '',
  filters = {},
  filterOptions,
  examTypeLabels
}: ExamsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== '' && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to first page when filtering
    router.push(`?${params.toString()}`)
  }

  const handleSearch = (query: string) => {
    updateFilters('search', query)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    router.push(`?${params.toString()}`)
  }

  const columns: ColumnDef<Exam>[] = [
    {
      accessorKey: 'title',
      header: 'Examen',
      cell: ({ row }) => (
        <div className="flex items-start gap-3 min-w-0">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: row.original.subject_color }}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate" title={row.original.title}>
              {row.original.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">{row.original.subject_name}</span>
              <span> • {row.original.series_name} ({row.original.country_name})</span>
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
      id: 'exam_info',
      header: 'Informations',
      cell: ({ row }) => (
        <div className="space-y-2">
          {getExamTypeBadge(row.original.exam_type, examTypeLabels)}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {row.original.exam_year && (
              <>
                <Calendar className="h-3 w-3" />
                <span>{row.original.exam_year}</span>
              </>
            )}
          </div>
          
          {row.original.exam_session && (
            <div className="text-xs text-muted-foreground truncate" title={row.original.exam_session}>
              {row.original.exam_session}
            </div>
          )}
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
                {row.original.duration_minutes}min
              </span>
            </div>
            
            {row.original.total_points && (
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {row.original.total_points} pts
                </span>
              </div>
            )}
            
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
          <Link href={`/dashboard/content/exams/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
              <span className="sr-only">Voir l'examen</span>
            </Button>
          </Link>
          <Link href={`/dashboard/content/exams/${row.original.id}/edit`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Modifier l'examen</span>
            </Button>
          </Link>
          {row.original.status === 'published' && (
            <Link href={`/exams/${row.original.id}`}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Voir publiquement</span>
              </Button>
            </Link>
          )}
          <DeleteConfirmationModal
            resourceType="exam"
            resourceName={row.original.title}
            resourceId={row.original.id}
            trigger={
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Supprimer l'examen</span>
              </Button>
            }
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..."
                defaultValue={searchQuery}
                className="pl-9"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Subject Filter */}
            <Select value={filters.subject_id || 'all'} onValueChange={(value) => updateFilters('subject_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les matières" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les matières</SelectItem>
                {filterOptions.subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Series Filter */}
            <Select value={filters.series_id || 'all'} onValueChange={(value) => updateFilters('series_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les séries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les séries</SelectItem>
                {filterOptions.series.map((serie) => (
                  <SelectItem key={serie.id} value={serie.id}>
                    {serie.name} ({serie.countries?.name || 'Unknown'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Exam Type Filter */}
            <Select value={filters.exam_type || 'all'} onValueChange={(value) => updateFilters('exam_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(examTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filters.status || 'all'} onValueChange={(value) => updateFilters('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={exams}
        searchable={false}
        filterable={false}
        loading={false}
        pageSize={exams.length} // Show all current data since we handle pagination server-side
      />
      
      {/* Custom Pagination */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Affichage de {Math.min((currentPage - 1) * pageSize + 1, totalCount)} à{' '}
            {Math.min(currentPage * pageSize, totalCount)} sur {totalCount} examens
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              Précédent
            </Button>
            
            <div className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground">Page</span>
              <span className="text-sm font-medium">{currentPage}</span>
              <span className="text-sm text-muted-foreground">sur</span>
              <span className="text-sm font-medium">{Math.ceil(totalCount / pageSize)}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalCount / pageSize)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
