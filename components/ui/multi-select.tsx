'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X, Search, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

export interface Option {
  label: string
  value: string
  color?: string
  icon?: React.ReactNode
  group?: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  maxDisplay?: number
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Sélectionnez des options...",
  searchPlaceholder = "Rechercher...",
  emptyText = "Aucune option trouvée.",
  maxDisplay = 3,
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange([])
  }

  const selectedOptions = options.filter((option) => selected.includes(option.value))
  const displayedOptions = selectedOptions.slice(0, maxDisplay)
  const remainingCount = selectedOptions.length - maxDisplay

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options
    const query = searchQuery.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.group?.toLowerCase().includes(query)
    )
  }, [options, searchQuery])

  // Group options by group if they have a group property
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || 'Général'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(option)
    return acc
  }, {} as Record<string, Option[]>)

  // Sort groups alphabetically, but keep "Général" first
  const sortedGroups = Object.keys(groupedOptions).sort((a, b) => {
    if (a === 'Général') return -1
    if (b === 'Général') return 1
    return a.localeCompare(b)
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between min-h-10 h-auto p-2 w-full',
            className
          )}
          disabled={disabled}
        >
          <div className="flex gap-1 flex-wrap flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {displayedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs flex items-center gap-1 max-w-[150px]"
                    style={option.color ? { backgroundColor: `${option.color}20`, borderColor: option.color } : {}}
                  >
                    {option.color && (
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    {option.icon && <span className="w-3 h-3 flex-shrink-0">{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemove(option.value)
                      }}
                    />
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{remainingCount}
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {selectedOptions.length > 0 && (
              <XCircle
                className="h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer"
                onClick={handleClearAll}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 min-w-[350px]" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              className="flex h-11 w-full rounded-md bg-transparent py-3 px-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <X
                className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
          <CommandList className="max-h-[300px]">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              <>
                {/* Selected count indicator */}
                {selected.length > 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground border-b bg-muted/30">
                    {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
                  </div>
                )}
                
                {sortedGroups.map((group) => (
                  <CommandGroup key={group} heading={group !== 'Général' ? group : undefined}>
                    {groupedOptions[group].map((option) => {
                      const isSelected = selected.includes(option.value)
                      return (
                        <CommandItem
                          key={option.value}
                          value={`${option.label} ${option.value}`}
                          onSelect={() => handleSelect(option.value)}
                          className={cn(
                            'flex items-center justify-between cursor-pointer',
                            isSelected && 'bg-primary/5'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {option.icon && <span className="w-4 h-4">{option.icon}</span>}
                            {option.color && (
                              <div
                                className="w-3 h-3 rounded-full border flex-shrink-0"
                                style={{ backgroundColor: option.color }}
                              />
                            )}
                            <span className={cn(isSelected && 'font-medium')}>{option.label}</span>
                          </div>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              isSelected ? 'opacity-100 text-primary' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
