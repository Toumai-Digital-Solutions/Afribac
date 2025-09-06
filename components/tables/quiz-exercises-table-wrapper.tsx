'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { QuizExercisesTable } from './quiz-exercises-table'

interface QuizExercisesTableWrapperProps {
  data: any[]
  totalCount: number
  currentPage: number
  pageSize: number
  searchQuery?: string
}

export function QuizExercisesTableWrapper({
  data,
  totalCount,
  currentPage,
  pageSize,
  searchQuery = '',
}: QuizExercisesTableWrapperProps) {
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
    if (query.trim()) {
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
    <QuizExercisesTable
      data={data}
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
