'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLoading } from '@/components/providers/loading-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete'
import { FileText, Save, AlertTriangle, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { logActivity } from '@/lib/activity'

interface SeriesModalProps {
  initialData?: {
    id: string
    name: string
    description: string | null
    country_id: string
  }
  mode?: 'create' | 'edit'
  trigger?: React.ReactNode
  onSuccess?: () => void
  defaultCountry?: string // Pre-select country for create mode
}

interface Country {
  id: string
  name: string
  code: string
}

export function SeriesModal({ initialData, mode = 'create', trigger, onSuccess, defaultCountry }: SeriesModalProps) {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    country_id: initialData?.country_id || defaultCountry || '',
  })
  const [countries, setCountries] = useState<Country[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingCountries, setLoadingCountries] = useState(false)

  const countryOptions: AutocompleteOption[] = countries
    .filter((country) => Boolean(country?.id))
    .map((country) => ({
      value: country.id,
      label: country.name,
      hint: country.code,
    }))

  useEffect(() => {
    if (open) {
      loadCountries()
    }
  }, [open])

  const loadCountries = async () => {
    setLoadingCountries(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, code')
        .order('name')

      if (error) throw error
      setCountries(data || [])
    } catch (error) {
      console.error('Error loading countries:', error)
      toast.error('Erreur lors du chargement des pays')
    } finally {
      setLoadingCountries(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la série est requis'
    }

    if (!formData.country_id) {
      newErrors.country_id = 'Le pays est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    startLoading()

    try {
      const supabase = createClient()
      
      const seriesData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        country_id: formData.country_id,
      }

      let result
      if (mode === 'edit' && initialData?.id) {
        result = await supabase
          .from('series')
          .update(seriesData)
          .eq('id', initialData.id)
          .select()
          .single()
      } else {
        result = await supabase
          .from('series')
          .insert(seriesData)
          .select()
          .single()
      }

      if (result.error) {
        throw result.error
      }

      toast.success(
        mode === 'edit' 
          ? 'Série modifiée avec succès' 
          : 'Série créée avec succès'
      )

      const savedSeries = (result as any).data

      await logActivity({
        action: mode === 'edit' ? 'series:update' : 'series:create',
        entityType: 'series',
        entityId: savedSeries?.id ?? initialData?.id ?? null,
        entityName: seriesData.name,
        metadata: {
          country_id: seriesData.country_id,
        },
      })
      
      setOpen(false)
      router.refresh()
      onSuccess?.()
      
      // Reset form for create mode
      if (mode === 'create') {
        setFormData({ name: '', description: '', country_id: '' })
      }
    } catch (error) {
      console.error('Error saving series:', error)
      toast.error(
        mode === 'edit' 
          ? 'Erreur lors de la modification de la série' 
          : 'Erreur lors de la création de la série'
      )
    } finally {
      setIsSubmitting(false)
      stopLoading()
    }
  }

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const defaultTrigger = mode === 'create' ? (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Ajouter une série
    </Button>
  ) : (
    <Button variant="outline">
      Modifier
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {mode === 'edit' ? 'Modifier la série' : 'Nouvelle série'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Modifiez les informations de la série' 
              : 'Remplissez les informations pour créer une nouvelle série'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Series Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la série *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name')(e.target.value)}
              placeholder="Ex: Terminale S"
              disabled={isSubmitting}
            />
            {errors.name && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.name}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Country Selection */}
          <div className="space-y-2">
            <Label htmlFor="country">Pays *</Label>
            <Autocomplete
              value={formData.country_id || null}
              onChange={(nextValue) => handleChange('country_id')(nextValue)}
              options={countryOptions}
              placeholder={loadingCountries ? 'Chargement...' : 'Sélectionnez un pays'}
              searchPlaceholder="Rechercher un pays..."
              emptyText="Aucun pays trouvé"
              loading={loadingCountries}
              disabled={isSubmitting}
            />
            {errors.country_id && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.country_id}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description')(e.target.value)}
              placeholder="Description de la série..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || loadingCountries}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting 
                ? (mode === 'edit' ? 'Modification...' : 'Création...') 
                : (mode === 'edit' ? 'Modifier' : 'Créer')
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
