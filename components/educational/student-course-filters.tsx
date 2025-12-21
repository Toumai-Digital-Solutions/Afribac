"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Autocomplete, AutocompleteOption } from "@/components/ui/autocomplete"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface FilterOption {
  id: string
  name: string
  color?: string | null
}

interface TopicOption {
  id: string
  name: string
  subject_id: string
  subject_name?: string | null
}

interface TagOption {
  id: string
  name: string
  color?: string | null
  type?: string | null
}

interface StudentCourseFiltersProps {
  search: string
  subjectId: string
  topicId: string
  tagIds: string[]
  sort: string
  subjects: FilterOption[]
  topics: TopicOption[]
  tags: TagOption[]
  countryName?: string | null
  seriesName?: string | null
}

const sortOptions: AutocompleteOption[] = [
  { value: "recommended", label: "Recommandé" },
  { value: "newest", label: "Nouveautés" },
  { value: "popular", label: "Populaire" },
  { value: "difficulty", label: "Difficulté" },
]

export function StudentCourseFilters({
  search,
  subjectId,
  topicId,
  tagIds,
  sort,
  subjects,
  topics,
  tags,
  countryName,
  seriesName,
}: StudentCourseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localSearch, setLocalSearch] = useState(search)

  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== "" && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const updateSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value.trim().length > 0) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  useEffect(() => {
    const handler = window.setTimeout(() => {
      updateSearch(localSearch)
    }, 350)
    return () => window.clearTimeout(handler)
  }, [localSearch, updateSearch])

  const availableTopics = useMemo(() => {
    const filtered = subjectId
      ? topics.filter((topic) => topic.subject_id === subjectId)
      : topics
    return filtered
      .filter((topic) => Boolean(topic?.id && topic?.name))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [subjectId, topics])

  const subjectOptions: AutocompleteOption[] = [
    { value: "all", label: "Toutes les matières" },
    ...subjects.map((subject) => ({
      value: subject.id,
      label: subject.name,
      leading: subject.color ? (
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
      ) : undefined,
    })),
  ]

  const topicOptions: AutocompleteOption[] = [
    { value: "all", label: "Tous les thèmes" },
    ...availableTopics.map((topic) => ({
      value: topic.id,
      label: topic.name,
      hint: subjectId ? undefined : topic.subject_name ?? undefined,
    })),
  ]

  const selectedTagIds = useMemo(() => tagIds.filter(Boolean), [tagIds])
  const selectedTags = useMemo(() => {
    const selected = new Map(tags.map((tag) => [tag.id, tag]))
    return selectedTagIds.map((id) => selected.get(id)).filter(Boolean) as TagOption[]
  }, [selectedTagIds, tags])

  const toggleTag = useCallback((tagId: string) => {
    const params = new URLSearchParams(searchParams)
    const current = new Set(selectedTagIds)
    if (current.has(tagId)) {
      current.delete(tagId)
    } else {
      current.add(tagId)
    }
    const next = Array.from(current)
    if (next.length > 0) {
      params.set("tag_ids", next.join(","))
    } else {
      params.delete("tag_ids")
    }
    router.push(`?${params.toString()}`)
  }, [router, searchParams, selectedTagIds])

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete("search")
    params.delete("subject_id")
    params.delete("topic_id")
    params.delete("tag_ids")
    params.delete("sort")
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const activeFiltersCount = [
    subjectId,
    topicId,
    selectedTagIds.length > 0 ? "tags" : "",
    sort && sort !== "recommended" ? "sort" : "",
    search?.trim() ? "search" : "",
  ].filter(Boolean).length

  const handleSubjectChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== "all") {
      params.set("subject_id", value)
    } else {
      params.delete("subject_id")
    }
    params.delete("topic_id")
    router.push(`?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Recherche et filtres
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un cours, un thème, un tag..."
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Autocomplete
            value={subjectId || "all"}
            onChange={(value) => handleSubjectChange(value)}
            options={subjectOptions}
            placeholder="Toutes les matières"
            searchPlaceholder="Rechercher une matière..."
            emptyText="Aucune matière trouvée"
          />

          <Autocomplete
            value={topicId || "all"}
            onChange={(value) => updateFilters("topic_id", value)}
            options={topicOptions}
            placeholder={availableTopics.length === 0 ? "Aucun thème" : "Tous les thèmes"}
            searchPlaceholder="Rechercher un thème..."
            emptyText={availableTopics.length === 0 ? "Aucun thème disponible" : "Aucun thème trouvé"}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>Tags</span>
                {selectedTagIds.length > 0 ? (
                  <Badge variant="secondary" className="ml-2">
                    {selectedTagIds.length}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Tags</div>
                <Button variant="ghost" size="sm" onClick={() => updateFilters("tag_ids", "")}>
                  Effacer
                </Button>
              </div>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {tags.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucun tag disponible.</div>
                ) : (
                  tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedTagIds.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      {tag.color ? (
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      ) : null}
                      <span>{tag.name}</span>
                    </label>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {countryName ? <Badge variant="outline">Pays: {countryName}</Badge> : null}
            {seriesName ? <Badge variant="outline">Série: {seriesName}</Badge> : null}
            {selectedTags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Autocomplete
              value={sort || "recommended"}
              onChange={(value) => updateFilters("sort", value)}
              options={sortOptions}
              placeholder="Recommandé"
              searchPlaceholder="Choisir un tri..."
              emptyText="Aucun tri"
            />
            <Button variant="ghost" size="sm" onClick={clearFilters} disabled={activeFiltersCount === 0}>
              <X className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
