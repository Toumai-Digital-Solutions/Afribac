'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { CoursesTable } from './courses-table'

interface Course {
  id: string
  title: string
  description: string | null
  subject_id: string
  subject_name: string
  subject_color: string
  subject_icon: string
  topic_id?: string | null
  topic_name?: string | null
  topic_slug?: string | null
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

interface CoursesTableWrapperProps {
  courses: Course[]
  totalCount: number
  currentPage: number
  pageSize: number
  searchQuery?: string
}

export function CoursesTableWrapper({
  courses,
  totalCount,
  currentPage,
  pageSize,
  searchQuery = '',
}: CoursesTableWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const handleSearch = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page when searching
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const handleFilter = useCallback((filters: Record<string, any>) => {
    const params = new URLSearchParams(searchParams)
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString())
      } else {
        params.delete(key)
      }
    })
    
    params.delete('page') // Reset to first page when filtering
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  return (
    <CoursesTable
      courses={courses}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      onFilter={handleFilter}
      searchQuery={searchQuery}
    />
  )
}
