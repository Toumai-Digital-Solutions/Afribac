'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Filter, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete'

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

interface TopicOption {
  id: string
  name: string
  subject_id: string
  subject_name?: string
}

interface CoursesFiltersProps {
  search: string
  subject_id: string
  topic_id: string
  country_id: string
  series_id: string
  status: string
  subjects: FilterOption[]
  topics: TopicOption[]
  countries: FilterOption[]
  series: SeriesOption[]
}

export function CoursesFilters({
  search,
  subject_id,
  topic_id,
  country_id,
  series_id,
  status,
  subjects,
  topics,
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

  const availableTopics = (subject_id
    ? topics.filter((topic) => topic.subject_id === subject_id)
    : topics
  )
    .filter((topic) => Boolean(topic?.id && topic?.name))
    .sort((a, b) => a.name.localeCompare(b.name))

  const subjectOptions: AutocompleteOption[] = [
    { value: 'all', label: 'Toutes les matières' },
    ...subjects
      .filter((subject) => Boolean(subject?.id))
      .map((subject) => ({
        value: subject.id,
        label: subject.name,
        leading: (
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
        ),
      }))
  ]

  const topicOptions: AutocompleteOption[] = [
    { value: 'all', label: 'Tous les thèmes' },
    ...availableTopics.map((topic) => ({
      value: topic.id,
      label: topic.name,
      hint: subject_id ? undefined : topic.subject_name,
    }))
  ]

  const countryOptions: AutocompleteOption[] = [
    { value: 'all', label: 'Tous les pays' },
    ...countries
      .filter((country) => Boolean(country?.id))
      .map((country) => ({
        value: country.id,
        label: country.name,
      }))
  ]

  const seriesOptions: AutocompleteOption[] = [
    { value: 'all', label: 'Toutes les séries' },
    ...series
      .filter((serie) => Boolean(serie?.id))
      .map((serie) => ({
        value: serie.id,
        label: serie.name,
        hint: serie.countries?.name,
      }))
  ]

  const statusOptions: AutocompleteOption[] = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'published', label: 'Publié' },
    { value: 'archived', label: 'Archivé' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Autocomplete
            value={subject_id || 'all'}
            onChange={(nextValue) => updateFilters('subject_id', nextValue)}
            options={subjectOptions}
            placeholder="Toutes les matières"
            searchPlaceholder="Rechercher une matière..."
            emptyText="Aucune matière trouvée"
          />

          {/* Thème Filter */}
          <Autocomplete
            value={topic_id || 'all'}
            onChange={(nextValue) => updateFilters('topic_id', nextValue)}
            options={topicOptions}
            placeholder={availableTopics.length === 0 ? 'Aucun thème' : 'Tous les thèmes'}
            searchPlaceholder="Rechercher un thème..."
            emptyText={availableTopics.length === 0 ? 'Aucun thème disponible' : 'Aucun thème trouvé'}
          />

          {/* Country Filter */}
          <Autocomplete
            value={country_id || 'all'}
            onChange={(nextValue) => updateFilters('country_id', nextValue)}
            options={countryOptions}
            placeholder="Tous les pays"
            searchPlaceholder="Rechercher un pays..."
            emptyText="Aucun pays trouvé"
          />

          {/* Series Filter */}
          <Autocomplete
            value={series_id || 'all'}
            onChange={(nextValue) => updateFilters('series_id', nextValue)}
            options={seriesOptions}
            placeholder="Toutes les séries"
            searchPlaceholder="Rechercher une série..."
            emptyText="Aucune série trouvée"
          />

          {/* Status Filter */}
          <Autocomplete
            value={status || 'all'}
            onChange={(nextValue) => updateFilters('status', nextValue)}
            options={statusOptions}
            placeholder="Tous les statuts"
            searchPlaceholder="Rechercher un statut..."
            emptyText="Aucun statut trouvé"
          />
        </div>

        {/* Active filters */}
        {(search || subject_id || topic_id || country_id || series_id || status) && (
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
            {topic_id && (
              <Badge variant="secondary">
                Thème: {topics.find((t) => t.id === topic_id)?.name}
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
                Statut: {status === 'draft' ? 'Brouillon' : status === 'published' ? 'Publié' : 'Archivé'}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
