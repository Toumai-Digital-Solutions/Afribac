'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  X
} from "lucide-react"

interface ServerFilteredDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterOptions?: { label: string; value: string }[]
  roleOptions?: { label: string; value: string }[]
  currentCountryFilter?: string
  currentRoleFilter?: string
  currentSearchFilter?: string
  pageSize?: number
  title?: string
  description?: string
}

export function ServerFilteredDataTable<TData, TValue>({
  columns,
  data,
  filterOptions = [],
  roleOptions = [],
  currentCountryFilter,
  currentRoleFilter,
  currentSearchFilter,
  pageSize = 10,
  title,
  description,
}: ServerFilteredDataTableProps<TData, TValue>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchInput, setSearchInput] = useState(currentSearchFilter || "")
  const [filterInput, setFilterInput] = useState(currentCountryFilter || "all")
  const [roleInput, setRoleInput] = useState(currentRoleFilter || "all")

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
  })

  const updateUrl = (newSearch?: string, newCountry?: string, newRole?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newSearch) {
      params.set('search', newSearch)
    } else {
      params.delete('search')
    }
    
    if (newCountry && newCountry !== 'all') {
      params.set('country', newCountry)
    } else {
      params.delete('country')
    }
    
    if (newRole && newRole !== 'all') {
      params.set('role', newRole)
    } else {
      params.delete('role')
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl(
      searchInput.trim() || undefined, 
      filterInput !== 'all' ? filterInput : undefined,
      roleInput !== 'all' ? roleInput : undefined
    )
  }

  const handleFilterChange = (value: string) => {
    setFilterInput(value)
    updateUrl(
      searchInput.trim() || undefined, 
      value !== 'all' ? value : undefined,
      roleInput !== 'all' ? roleInput : undefined
    )
  }
  
  const handleRoleChange = (value: string) => {
    setRoleInput(value)
    updateUrl(
      searchInput.trim() || undefined, 
      filterInput !== 'all' ? filterInput : undefined,
      value !== 'all' ? value : undefined
    )
  }

  const clearFilters = () => {
    setSearchInput("")
    setFilterInput("all")
    setRoleInput("all")
    router.push(window.location.pathname)
  }

  const activeFiltersCount = (currentSearchFilter ? 1 : 0) + (currentCountryFilter ? 1 : 0) + (currentRoleFilter ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      {(title || description) && (
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:space-x-2">
          {/* Global Search */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-sm flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une série..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" size="sm" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Filter Dropdowns */}
          <div className="flex gap-2">
            {filterOptions.length > 0 && (
              <Select value={filterInput} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Pays..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {roleOptions.length > 0 && (
              <Select value={roleInput} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Rôle..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-8 px-2 lg:px-3"
            >
              Effacer
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Active Filters Count */}
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="hidden md:inline-flex">
              {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Results Summary */}
              {(currentSearchFilter || currentCountryFilter || currentRoleFilter) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{data.length} résultat{data.length !== 1 ? 's' : ''} trouvé{data.length !== 1 ? 's' : ''}</span>
            {currentSearchFilter && (
              <Badge variant="secondary" className="text-xs">
                Recherche: "{currentSearchFilter}"
              </Badge>
            )}
            {currentCountryFilter && (
              <Badge variant="secondary" className="text-xs">
                Pays filtré
              </Badge>
            )}
            {currentRoleFilter && (
              <Badge variant="secondary" className="text-xs">
                Rôle filtré
              </Badge>
            )}
          </div>
        )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="text-lg">📭</div>
                    <p>Aucun résultat trouvé</p>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={clearFilters}
                        className="h-auto p-0"
                      >
                        Effacer les filtres
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {data.length} résultat{data.length !== 1 ? 's' : ''} au total
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Lignes par page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Première page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Page précédente</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <div className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} sur{" "}
                {table.getPageCount()}
              </div>
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Page suivante</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Dernière page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
