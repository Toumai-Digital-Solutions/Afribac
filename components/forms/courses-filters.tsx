'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Filter, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface FilterOption {
  id: string
  name: string
  color?: string
}

interface SeriesOption {
  id: string
  name: string
  countries?: { name: string }
}

interface CoursesFiltersProps {
  search: string
  subject_id: string
  country_id: string
  series_id: string
  status: string
  subjects: FilterOption[]
  countries: FilterOption[]
  series: SeriesOption[]
}

export function CoursesFilters({
  search,
  subject_id,
  country_id,
  series_id,
  status,
  subjects,
  countries,
  series,
}: CoursesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== '' && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to first page when filtering
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateFilters('search', value)
  }, [updateFilters])

  return (
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
              defaultValue={search}
              className="pl-9"
              onChange={handleSearchChange}
            />
          </div>

          {/* Subject Filter */}
          <Select value={subject_id || 'all'} onValueChange={(value) => updateFilters('subject_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les matières" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {subjects.map((subject) => (
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

          {/* Country Filter */}
          <Select value={country_id || 'all'} onValueChange={(value) => updateFilters('country_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les pays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les pays</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Series Filter */}
          <Select value={series_id || 'all'} onValueChange={(value) => updateFilters('series_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les séries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les séries</SelectItem>
              {series.map((serie) => (
                <SelectItem key={serie.id} value={serie.id}>
                  {serie.name} ({serie.countries?.name || 'Unknown'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={status || 'all'} onValueChange={(value) => updateFilters('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="publish">Publié</SelectItem>
              <SelectItem value="archived">Archivé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filters */}
        {(search || subject_id || country_id || series_id || status) && (
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Filtres actifs:</span>
            {search && (
              <Badge variant="secondary">
                Recherche: {search}
              </Badge>
            )}
            {subject_id && (
              <Badge variant="secondary">
                Matière: {subjects.find((s) => s.id === subject_id)?.name}
              </Badge>
            )}
            {country_id && (
              <Badge variant="secondary">
                Pays: {countries.find((c) => c.id === country_id)?.name}
              </Badge>
            )}
            {series_id && (
              <Badge variant="secondary">
                Série: {series.find((s) => s.id === series_id)?.name}
              </Badge>
            )}
            {status && (
              <Badge variant="secondary">
                Statut: {status === 'draft' ? 'Brouillon' : status === 'publish' ? 'Publié' : 'Archivé'}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
