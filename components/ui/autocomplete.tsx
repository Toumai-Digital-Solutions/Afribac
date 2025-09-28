"use client"

import * as React from "react"

import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export interface AutocompleteOption {
  value: string
  label: string
  hint?: string
  group?: string
  disabled?: boolean
  searchKeywords?: string[]
  leading?: React.ReactNode
  trailing?: React.ReactNode
}

interface AutocompleteProps {
  value: string | null
  onChange: (value: string, option: AutocompleteOption | undefined) => void
  options: AutocompleteOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  triggerClassName?: string
  align?: "start" | "center" | "end"
  alignOffset?: number
  renderTrigger?: (option: AutocompleteOption | undefined) => React.ReactNode
  renderOption?: (option: AutocompleteOption, selected: boolean) => React.ReactNode
}

export function Autocomplete({
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyText = "Aucun résultat",
  disabled = false,
  loading = false,
  className,
  triggerClassName,
  align = "start",
  alignOffset,
  renderTrigger,
  renderOption,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false)

  const validOptions = React.useMemo(
    () => options.filter((option) => Boolean(option?.value)),
    [options]
  )

  const selectedOption = validOptions.find((option) => option.value === value) ?? undefined

  const groupedOptions = React.useMemo(() => {
    const groups = new Map<string, AutocompleteOption[]>()
    validOptions.forEach((option) => {
      const key = option.group ?? "__default__"
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(option)
    })
    return Array.from(groups.entries())
  }, [validOptions])

  const handleSelect = React.useCallback(
    (option: AutocompleteOption) => {
      if (option.disabled) return
      onChange(option.value, option)
      setOpen(false)
    },
    [onChange]
  )

  return (
    <Popover open={open} onOpenChange={(nextOpen) => !disabled && setOpen(nextOpen)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !selectedOption && "text-muted-foreground",
            triggerClassName
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
            {renderTrigger ? (
              renderTrigger(selectedOption)
            ) : selectedOption ? (
              <>
                {selectedOption.leading}
                <span className="truncate">{selectedOption.label}</span>
                {selectedOption.hint && (
                  <span className="text-xs text-muted-foreground">{selectedOption.hint}</span>
                )}
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)} align={align} alignOffset={alignOffset}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </div>
            ) : (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            {!loading && groupedOptions.map(([group, groupOptions]) => (
              <CommandGroup key={group} heading={group === "__default__" ? undefined : group}>
                {groupOptions.map((option) => {
                  const isSelected = option.value === selectedOption?.value
                  return (
                    <CommandItem
                      key={option.value}
                      value={
                        option.label +
                        (option.hint ? ` ${option.hint}` : "") +
                        (option.searchKeywords ? ` ${option.searchKeywords.join(" ")}` : "")
                      }
                      onSelect={() => handleSelect(option)}
                      disabled={option.disabled}
                    >
                      <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {renderOption ? (
                          renderOption(option, isSelected)
                        ) : (
                          <>
                            {option.leading}
                            <span className="truncate">{option.label}</span>
                            {option.hint && (
                              <span className="text-xs text-muted-foreground">{option.hint}</span>
                            )}
                          </>
                        )}
                      </div>
                      {option.trailing}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

Autocomplete.displayName = "Autocomplete"

