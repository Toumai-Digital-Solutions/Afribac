'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Loader2, AlertCircle, Check, ChevronsUpDown, Globe2, GraduationCap } from 'lucide-react'
import type { Country, Series, UserRole } from '@/types/database'
import { cn } from '@/lib/utils'

interface OnboardingFormProps {
  role: UserRole
  userId: string
  initialCountries: Country[]
  initialCountryId?: string
  initialSeries?: Series[]
  initialSeriesId?: string
}

export function OnboardingForm({
  role,
  userId,
  initialCountries,
  initialCountryId = '',
  initialSeries = [],
  initialSeriesId = '',
}: OnboardingFormProps) {
  const supabase = createClient()
  const countries = initialCountries
  const [series, setSeries] = useState<Series[]>(initialSeries)
  const [countryId, setCountryId] = useState(initialCountryId)
  const [seriesId, setSeriesId] = useState(initialSeriesId)
  const [countryOpen, setCountryOpen] = useState(false)
  const [seriesOpen, setSeriesOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [seriesLoading, setSeriesLoading] = useState(false)
  const initialCountryRef = useRef(initialCountryId)
  const initialSeriesRef = useRef(initialSeries)

  useEffect(() => {
    if (!countryId) {
      setSeries([])
      setSeriesLoading(false)
      return
    }

    if (countryId === initialCountryRef.current && initialSeriesRef.current.length) {
      setSeries(initialSeriesRef.current)
      setSeriesLoading(false)
      return
    }

    let ignore = false
    const loadSeries = async () => {
      setSeriesLoading(true)
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .eq('country_id', countryId)
        .order('name')

      if (ignore) return

      if (error) {
        console.error('Failed to load series', error)
        setSeries([])
      } else {
        setSeries(data || [])
      }
      setSeriesLoading(false)
    }

    loadSeries()

    return () => {
      ignore = true
    }
  }, [countryId, supabase])

  const onSave = async () => {
    setSaving(true)
    setError('')
    try {
      const update: any = { country_id: countryId }
      if (role === 'user') update.series_id = seriesId

      const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', userId)

      if (error) throw error

      window.location.href = '/dashboard'
    } catch (e: any) {
      setError(e?.message || 'Échec de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const selectedCountry = countries.find((c) => c.id === countryId)
  const selectedSeries = series.find((s) => s.id === seriesId)

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Sélectionnez votre pays</span>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={countryOpen}
              className="w-full justify-between rounded-2xl h-12"
            >
              <span className="flex items-center gap-2 truncate">
                <Globe2 className="h-4 w-4 text-muted-foreground" />
                {selectedCountry ? selectedCountry.name : 'Choisir un pays'}
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un pays…" />
              <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.id}
                      value={country.name}
                      onSelect={() => {
                        setCountryId(country.id)
                        setSeriesId('')
                        setCountryOpen(false)
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', country.id === countryId ? 'opacity-100' : 'opacity-0')} />
                      <span className="flex-1 truncate">{country.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {role === 'user' && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">Choisissez votre série</span>
          <Popover open={seriesOpen} onOpenChange={(open) => countryId && setSeriesOpen(open)}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={seriesOpen}
                disabled={!countryId}
                className="w-full justify-between rounded-2xl h-12 disabled:opacity-50"
              >
                <span className="flex items-center gap-2 truncate">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  {selectedSeries ? selectedSeries.name : countryId ? 'Choisir une série' : 'Sélectionnez d’abord un pays'}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              <Command>
              <CommandInput placeholder="Rechercher une série…" />
              <CommandList>
                {seriesLoading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement…
                  </div>
                ) : series.length === 0 ? (
                  <CommandEmpty>Aucune série disponible pour ce pays.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {series.map((serie) => (
                      <CommandItem
                        key={serie.id}
                        value={serie.name}
                        onSelect={() => {
                          setSeriesId(serie.id)
                          setSeriesOpen(false)
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4', serie.id === seriesId ? 'opacity-100' : 'opacity-0')} />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{serie.name}</div>
                          {serie.description && (
                            <p className="text-xs text-muted-foreground truncate">{serie.description}</p>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
          {!countryId && (
            <p className="text-xs text-muted-foreground">Veuillez sélectionner un pays pour afficher les séries disponibles.</p>
          )}
        </div>
      )}

      <Button onClick={onSave} className="w-full h-12 rounded-2xl" disabled={!countryId || (role === 'user' && !seriesId) || saving}>
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sauvegarde…
          </>
        ) : (
          'Continuer'
        )}
      </Button>
      {error && (
        <Alert className="mt-2 border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
