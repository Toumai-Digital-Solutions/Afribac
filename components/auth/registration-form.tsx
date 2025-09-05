'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signUp } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { Country, Series } from '@/types/database'

export function RegistrationForm() {
  // Create supabase client
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    countryId: '',
    seriesId: ''
  })
  const [countries, setCountries] = useState<Country[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load countries and series
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load countries (public data)
        const { data: countriesData } = await supabase
          .from('countries')
          .select('*')
          .order('name')

        setCountries(countriesData || [])
      } catch (err) {
        console.error('Failed to load countries:', err)
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  // Load series when country is selected
  useEffect(() => {
    const loadSeries = async () => {
      if (formData.countryId) {
        const { data: seriesData } = await supabase
          .from('series')
          .select('*')
          .eq('country_id', formData.countryId)
          .order('name')

        setSeries(seriesData || [])
      } else {
        setSeries([])
      }
    }

    loadSeries()
  }, [formData.countryId])

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Reset series selection when country changes
    if (field === 'countryId') {
      setFormData(prev => ({
        ...prev,
        seriesId: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    if (!formData.countryId) {
      setError('Veuillez sélectionner votre pays')
      setLoading(false)
      return
    }

    if (!formData.seriesId) {
      setError('Veuillez sélectionner votre série')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        country_id: formData.countryId,
        series_id: formData.seriesId,
        role: 'user' // Default to student
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Compte créé avec succès! Vérifiez votre email pour confirmer votre inscription.')
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          countryId: '',
          seriesId: ''
        })
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <Card className="w-[500px]">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Chargement...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Rejoignez Afribac pour accéder aux contenus éducatifs de votre pays
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Votre nom complet"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName')(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => handleChange('email')(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Select value={formData.countryId} onValueChange={handleChange('countryId')}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre pays" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.flag_url} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="series">Série</Label>
            <Select 
              value={formData.seriesId} 
              onValueChange={handleChange('seriesId')}
              disabled={!formData.countryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre série" />
              </SelectTrigger>
              <SelectContent>
                {series.map((serie) => (
                  <SelectItem key={serie.id} value={serie.id}>
                    {serie.name} - {serie.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Au moins 6 caractères"
              value={formData.password}
              onChange={(e) => handleChange('password')(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Répétez votre mot de passe"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword')(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création du compte...
              </>
            ) : (
              'Créer mon compte'
            )}
          </Button>
        </form>

        {(error || success) && (
          <Alert className={`mt-4 ${error ? 'border-destructive' : 'border-green-500'}`}>
            {error && <AlertCircle className="h-4 w-4" />}
            <AlertDescription>
              {error || success}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
