'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import type { Country, Series, UserRole } from '@/types/database'
import { SelectorGrid } from '@/components/auth/selector-grid'

export function OnboardingForm({ role }: { role: UserRole }) {
  const supabase = createClient()
  const [countries, setCountries] = useState<Country[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [countryId, setCountryId] = useState('')
  const [seriesId, setSeriesId] = useState('')
  const [qCountry, setQCountry] = useState('')
  const [qSeries, setQSeries] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [countriesRes, userRes] = await Promise.all([
          supabase.from('countries').select('*').order('name'),
          supabase.auth.getUser(),
        ])

        setCountries(countriesRes.data || [])

        // Pre-fill from existing profile if any
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userRes.data.user?.id)
          .single()

        if (profile?.country_id) setCountryId(profile.country_id)
        if (profile?.series_id) setSeriesId(profile.series_id)

        if (profile?.country_id) {
          const { data: s } = await supabase
            .from('series')
            .select('*')
            .eq('country_id', profile.country_id)
            .order('name')
          setSeries(s || [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadSeries = async () => {
      if (!countryId) return setSeries([])
      const { data } = await supabase
        .from('series')
        .select('*')
        .eq('country_id', countryId)
        .order('name')
      setSeries(data || [])
    }
    loadSeries()
  }, [countryId])

  const onSave = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      const update: any = { country_id: countryId }
      if (role === 'user') update.series_id = seriesId

      const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', user.id)

      if (error) throw error

      window.location.href = '/dashboard'
    } catch (e: any) {
      setError(e?.message || 'Échec de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Chargement…</span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Input
          placeholder="Rechercher un pays"
          value={qCountry}
          onChange={(e) => setQCountry(e.target.value)}
          className="h-12 rounded-2xl bg-muted/40 border-none"
        />
        <SelectorGrid
          items={countries
            .filter((c) => c.name.toLowerCase().includes(qCountry.toLowerCase()))
            .map((c) => ({ id: c.id, label: c.name, image: c.flag_url }))}
          value={countryId}
          onChange={(id) => { setCountryId(id); setSeriesId('') }}
        />
      </div>

      {role === 'user' && (
        <div className="space-y-3">
          <Input
            placeholder="Rechercher une série"
            value={qSeries}
            onChange={(e) => setQSeries(e.target.value)}
            className="h-12 rounded-2xl bg-muted/40 border-none"
          />
          <SelectorGrid
            items={series
              .filter((s) => s.name.toLowerCase().includes(qSeries.toLowerCase()))
              .map((s) => ({ id: s.id, label: s.name, sublabel: s.description }))}
            value={seriesId}
            onChange={setSeriesId}
          />
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
