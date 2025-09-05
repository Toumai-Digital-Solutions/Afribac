'use client'

import { FilterBadge } from './filter-badge'
import { useRouter } from 'next/navigation'

interface FilterHeaderProps {
  title: string
  description: string
  icon: React.ReactNode
  children?: React.ReactNode
  searchFilter?: {
    value: string
    clearUrl: string
  }
  countryFilter?: {
    value: string
    clearUrl: string
  }
  roleFilter?: {
    value: string
    clearUrl: string
  }
}

export function FilterHeader({ 
  title, 
  description, 
  icon, 
  children, 
  searchFilter, 
  countryFilter,
  roleFilter 
}: FilterHeaderProps) {
  const router = useRouter()

  const handleRemoveFilter = (clearUrl: string) => {
    router.push(clearUrl)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {icon}
          {title}
        </h1>
        <p className="text-muted-foreground">
          {description}
        </p>
        
        {/* Filter badges */}
        <div className="flex items-center gap-2 mt-2">
          {searchFilter && (
            <>
              <span className="text-sm text-muted-foreground">Recherche:</span>
              <FilterBadge
                label="Terme"
                value={searchFilter.value}
                onRemove={() => handleRemoveFilter(searchFilter.clearUrl)}
              />
            </>
          )}
          
          {countryFilter && (
            <>
              <span className="text-sm text-muted-foreground">Filtré par:</span>
              <FilterBadge
                label="Pays"
                value={countryFilter.value}
                onRemove={() => handleRemoveFilter(countryFilter.clearUrl)}
              />
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
