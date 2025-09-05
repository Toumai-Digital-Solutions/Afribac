'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLoading } from '@/components/providers/loading-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Globe, Save, AlertTriangle, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface CountryModalProps {
  initialData?: {
    id: string
    name: string
    code: string
  }
  mode?: 'create' | 'edit'
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CountryModal({ initialData, mode = 'create', trigger, onSuccess }: CountryModalProps) {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du pays est requis'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Le code du pays est requis'
    } else if (formData.code.length !== 2) {
      newErrors.code = 'Le code doit contenir exactement 2 caractères'
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
      
      const countryData = {
        name: formData.name.trim(),
        code: formData.code.toUpperCase().trim(),
      }

      let result
      if (mode === 'edit' && initialData?.id) {
        result = await supabase
          .from('countries')
          .update(countryData)
          .eq('id', initialData.id)
          .select()
          .single()
      } else {
        result = await supabase
          .from('countries')
          .insert(countryData)
          .select()
          .single()
      }

      if (result.error) {
        throw result.error
      }

      toast.success(
        mode === 'edit' 
          ? 'Pays modifié avec succès' 
          : 'Pays créé avec succès'
      )
      
      setOpen(false)
      router.refresh()
      onSuccess?.()
      
      // Reset form for create mode
      if (mode === 'create') {
        setFormData({ name: '', code: '' })
      }
    } catch (error) {
      console.error('Error saving country:', error)
      toast.error(
        mode === 'edit' 
          ? 'Erreur lors de la modification du pays' 
          : 'Erreur lors de la création du pays'
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
      Ajouter un pays
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
            <Globe className="h-5 w-5" />
            {mode === 'edit' ? 'Modifier le pays' : 'Nouveau pays'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Modifiez les informations du pays' 
              : 'Remplissez les informations pour créer un nouveau pays'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du pays *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name')(e.target.value)}
              placeholder="Ex: Sénégal"
              disabled={isSubmitting}
            />
            {errors.name && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.name}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Country Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Code du pays *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleChange('code')(e.target.value)}
              placeholder="Ex: SN"
              maxLength={2}
              className="uppercase"
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              Code ISO à 2 caractères (ex: SN pour Sénégal)
            </p>
            {errors.code && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.code}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
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
