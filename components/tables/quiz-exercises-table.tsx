'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Edit, Trash2, ExternalLink, Brain, FileText, Clock, Users, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/tables/data-table'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Type for the quiz/exercise data from the view
interface QuizExerciseTableData {
  id: string
  title: string
  description: string | null
  content_type: 'quiz' | 'exercise'
  difficulty_level: number
  estimated_duration: number
  status: 'draft' | 'published' | 'archived'
  view_count: number
  question_count: number
  total_points: number
  subject_name: string
  subject_color: string
  subject_icon: string | null
  series_name: string
  country_name: string
  course_id: string | null
  course_title: string | null
  course_status: string | null
  author_name: string | null
  tag_names: string[]
  created_at: string
  updated_at: string
}

interface QuizExercisesTableProps {
  data: QuizExerciseTableData[]
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onFilter: (filters: Record<string, any>) => void
  searchQuery?: string
  filters?: Record<string, any>
}

const statusConfig = {
  draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Brouillon' },
  published: { color: 'bg-green-100 text-green-800', label: 'Publié' },
  archived: { color: 'bg-gray-100 text-gray-800', label: 'Archivé' },
}

const difficultyLabels = ['', 'Très facile', 'Facile', 'Moyen', 'Difficile', 'Très difficile']

const columns: ColumnDef<QuizExerciseTableData>[] = [
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => {
      const isQuiz = row.original.content_type === 'quiz'
      const Icon = isQuiz ? Brain : FileText
      const iconColor = isQuiz ? 'text-blue-500' : 'text-green-500'
      
      return (
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{row.original.title}</div>
            {row.original.description && (
              <div className="text-xs text-muted-foreground truncate mt-1">
                {row.original.description}
              </div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'subject_name',
    header: 'Matière',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0" 
          style={{ backgroundColor: row.original.subject_color }}
        />
        <span className="text-sm font-medium">{row.original.subject_name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'series_name',
    header: 'Série',
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">{row.original.series_name}</div>
        <div className="text-xs text-muted-foreground">{row.original.country_name}</div>
        {row.original.course_title && (
          <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            {row.original.course_title}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'content_type',
    header: 'Type',
    cell: ({ row }) => {
      const isQuiz = row.original.content_type === 'quiz'
      return (
        <Badge variant={isQuiz ? 'default' : 'secondary'} className="text-xs">
          {isQuiz ? 'Quiz' : 'Exercice'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'difficulty_level',
    header: 'Difficulté',
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < row.original.difficulty_level ? 'bg-orange-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{difficultyLabels[row.original.difficulty_level]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: 'stats',
    header: 'Statistiques',
    cell: ({ row }) => (
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{row.original.question_count}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.original.question_count} question(s)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                <span>{row.original.total_points}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.original.total_points} point(s) au total</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{row.original.estimated_duration}min</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Durée estimée: {row.original.estimated_duration} minutes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{row.original.view_count}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.original.view_count} vue(s)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = statusConfig[row.original.status as keyof typeof statusConfig]
      return (
        <Badge className={status.color} variant="secondary">
          {status.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'author_name',
    header: 'Auteur',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-xs">
            {row.original.author_name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">{row.original.author_name || 'Inconnu'}</span>
      </div>
    ),
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1 max-w-32">
        {row.original.tag_names.length > 0 ? (
          row.original.tag_names.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
              {tag}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">Aucun tag</span>
        )}
        {row.original.tag_names.length > 2 && (
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            +{row.original.tag_names.length - 2}
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Link href={`/dashboard/admin/quiz-exercises/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
            <span className="sr-only">Voir le détail</span>
          </Button>
        </Link>
        <Link href={`/dashboard/content/quiz/${row.original.id}/edit`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Modifier</span>
          </Button>
        </Link>
        {row.original.status === 'published' && (
          <Link href={`/quiz/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Voir publiquement</span>
            </Button>
          </Link>
        )}
        <DeleteConfirmationModal
          resourceType="quiz_exercise"
          resourceName={row.original.title}
          resourceId={row.original.id}
          trigger={
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Supprimer</span>
            </Button>
          }
        />
      </div>
    ),
  },
]

export function QuizExercisesTable({
  data,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onSearch,
  onFilter,
  searchQuery = '',
  filters = {},
}: QuizExercisesTableProps) {
  const handlePageChange = (page: number) => {
    onPageChange(page)
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        searchable={false}
        filterable={false}
        loading={false}
        pageSize={data.length} // Show all current data since we handle pagination server-side
      />
      
      {/* Custom Pagination */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Affichage de {Math.min((currentPage - 1) * pageSize + 1, totalCount)} à{' '}
            {Math.min(currentPage * pageSize, totalCount)} sur {totalCount} éléments
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
