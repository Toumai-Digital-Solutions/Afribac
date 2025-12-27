'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Subject, Series } from '@/types/database'

interface Course {
  id: string
  title: string
}

interface QuizExercisesFiltersProps {
  search: string
  content_type: string
  subject_id: string
  series_id: string
  course_id: string
  status: string
  subjects: Subject[]
  series: (Series & { countries: { name: string } })[]
  courses: Course[]
}

export function QuizExercisesFilters({
  search,
  content_type,
  subject_id,
  series_id,
  course_id,
  status,
  subjects,
  series,
  courses,
}: QuizExercisesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    params.delete('page') // Reset to first page when filtering
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const clearFilters = useCallback(() => {
    router.push('/dashboard/content/quiz')
  }, [router])

  const activeFiltersCount = [content_type, subject_id, series_id, course_id, status, search].filter(Boolean).length

  const subjectOptions: AutocompleteOption[] = [
    { value: 'all', label: 'Toutes les matières' },
    ...subjects.map((subject) => ({
      value: subject.id,
      label: subject.name,
      leading: (
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: subject.color }}
        />
      ),
    })),
  ]

  const seriesOptions: AutocompleteOption[] = [
    { value: 'all', label: 'Toutes les séries' },
    ...series.map((serie) => ({
      value: serie.id,
      label: serie.name,
      hint: serie.countries?.name,
    })),
  ]

  const courseOptions: AutocompleteOption[] = [
    { value: 'all', label: 'Tous les cours' },
    { value: 'none', label: 'Sans cours (autonomes)' },
    ...courses.map((course) => ({
      value: course.id,
      label: course.title,
    })),
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher des quiz/exercices..."
              value={search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={content_type || 'all'} onValueChange={(value) => updateFilters({ content_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="quiz">Quiz seulement</SelectItem>
                  <SelectItem value="exercise">Exercices seulement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Matière</label>
              <Autocomplete
                value={subject_id || 'all'}
                onChange={(nextValue) => updateFilters({ subject_id: nextValue })}
                options={subjectOptions}
                placeholder="Toutes les matières"
                searchPlaceholder="Rechercher une matière..."
                emptyText="Aucune matière trouvée"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Série</label>
              <Autocomplete
                value={series_id || 'all'}
                onChange={(nextValue) => updateFilters({ series_id: nextValue })}
                options={seriesOptions}
                placeholder="Toutes les séries"
                searchPlaceholder="Rechercher une série..."
                emptyText="Aucune série trouvée"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cours</label>
              <Autocomplete
                value={course_id || 'all'}
                onChange={(nextValue) => updateFilters({ course_id: nextValue })}
                options={courseOptions}
                placeholder="Tous les cours"
                searchPlaceholder="Rechercher un cours..."
                emptyText="Aucun cours trouvé"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Statut</label>
              <Select value={status || 'all'} onValueChange={(value) => updateFilters({ status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters & Clear */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                <Badge variant="secondary" className="text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  {activeFiltersCount}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Effacer les filtres
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
