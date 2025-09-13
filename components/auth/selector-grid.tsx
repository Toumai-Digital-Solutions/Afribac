'use client'

import { useMemo } from 'react'

interface Item {
  id: string
  label: string
  sublabel?: string | null
  image?: string | null
}

export function SelectorGrid({
  items,
  value,
  onChange,
}: {
  items: Item[]
  value: string
  onChange: (id: string) => void
}) {
  const selected = useMemo(() => value, [value])

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => {
        const active = it.id === selected
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={`group relative rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              active ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {it.image ? (
                // plain img to avoid Next/Image setup requirements here
                <img src={it.image} alt="" className="h-8 w-8 rounded object-cover" />
              ) : (
                <div className="h-8 w-8 rounded bg-muted" />
              )}
              <div className="min-w-0">
                <div className="truncate font-medium">{it.label}</div>
                {it.sublabel && (
                  <div className="truncate text-xs text-muted-foreground">{it.sublabel}</div>
                )}
              </div>
            </div>
            {active && (
              <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}

