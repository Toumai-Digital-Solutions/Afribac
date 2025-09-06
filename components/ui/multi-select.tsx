'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
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

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const selectedOptions = options.filter((option) => selected.includes(option.value))
  const displayedOptions = selectedOptions.slice(0, maxDisplay)
  const remainingCount = selectedOptions.length - maxDisplay

  // Group options by group if they have a group property
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'main'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(option)
    return acc
  }, {} as Record<string, Option[]>)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between min-h-10 h-auto p-2',
            className
          )}
          disabled={disabled}
        >
          <div className="flex gap-1 flex-wrap">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {displayedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                    style={option.color ? { backgroundColor: `${option.color}20`, borderColor: option.color } : {}}
                  >
                    {option.icon && <span className="w-3 h-3">{option.icon}</span>}
                    {option.label}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
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
                    +{remainingCount} autres
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 min-w-[300px]" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {Object.entries(groupedOptions).map(([group, groupOptions]) => (
              <CommandGroup key={group} heading={group !== 'main' ? group : undefined}>
                {groupOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {option.icon && <span className="w-4 h-4">{option.icon}</span>}
                      {option.color && (
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <span>{option.label}</span>
                    </div>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
