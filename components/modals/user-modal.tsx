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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Save, AlertTriangle, Plus, User, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

interface UserModalProps {
  initialData?: {
    id: string
    email: string
    full_name: string | null
    role: string
    country_id: string
    series_id: string | null
    phone: string | null
    date_of_birth: string | null
    status: string
  }
  mode?: 'create' | 'edit'
  trigger?: React.ReactNode
  onSuccess?: () => void
}

interface Country {
  id: string
  name: string
  code: string
}

interface Series {
  id: string
  name: string
  description: string | null
  country_id: string
}

export function UserModal({ initialData, mode = 'create', trigger, onSuccess }: UserModalProps) {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    full_name: initialData?.full_name || '',
    role: initialData?.role || 'user',
    country_id: initialData?.country_id || '',
    series_id: initialData?.series_id || '',
    phone: initialData?.phone || '',
    date_of_birth: initialData?.date_of_birth || '',
    status: initialData?.status || 'active',
  })
  const [countries, setCountries] = useState<Country[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingSeries, setLoadingSeries] = useState(false)

  useEffect(() => {
    if (open) {
      loadCountries()
    }
  }, [open])

  useEffect(() => {
    if (formData.country_id) {
      loadSeries(formData.country_id)
    } else {
      setSeries([])
      setFormData(prev => ({ ...prev, series_id: '' }))
    }
  }, [formData.country_id])

  useEffect(() => {
    // Clear series if role is not 'user'
    if (formData.role !== 'user') {
      setFormData(prev => ({ ...prev, series_id: '' }))
    }
  }, [formData.role])

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

  const loadSeries = async (countryId: string) => {
    setLoadingSeries(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('series')
        .select('id, name, description, country_id')
        .eq('country_id', countryId)
        .order('name')

      if (error) throw error
      setSeries(data || [])
    } catch (error) {
      console.error('Error loading series:', error)
      toast.error('Erreur lors du chargement des séries')
    } finally {
      setLoadingSeries(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    if (!formData.country_id) {
      newErrors.country_id = 'Le pays est requis'
    }

    // For students, series is required
    if (formData.role === 'user' && !formData.series_id) {
      newErrors.series_id = 'La série est requise pour les étudiants'
    }

    if (formData.date_of_birth && !isValidDate(formData.date_of_birth)) {
      newErrors.date_of_birth = 'Format de date invalide (YYYY-MM-DD)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidDate = (dateString: string) => {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})
    startLoading()

    try {
      const supabase = createClient()
      
      const userData = {
        email: formData.email.trim(),
        full_name: formData.full_name.trim() || null,
        role: formData.role,
        country_id: formData.country_id,
        series_id: formData.role === 'user' ? formData.series_id || null : null,
        phone: formData.phone.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        status: formData.status,
      }

      let result
      if (mode === 'edit' && initialData) {
        result = await supabase
          .from('profiles')
          .update(userData)
          .eq('id', initialData.id)
          .select()
          .single()
      } else {
        // For creation, use Supabase Edge Function
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          throw new Error('Session non valide')
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(userData),
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || 'Erreur lors de la création de l\'utilisateur')
        }

        result = { data: responseData.user, error: null }
      }

      if (result.error) throw result.error

      const successMessage = mode === 'edit' 
        ? 'Utilisateur modifié avec succès'
        : 'Utilisateur créé avec succès. Un email de réinitialisation de mot de passe a été envoyé.'
      
      toast.success(successMessage)
      
      setOpen(false)
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }

    } catch (error: any) {
      console.error('Error saving user:', error)
      setErrors({ form: error.message || `Erreur lors de la ${mode === 'edit' ? 'modification' : 'création'} de l'utilisateur` })
    } finally {
      setIsSubmitting(false)
      stopLoading()
    }
  }

  const isFormValid = formData.email.trim() && formData.country_id && 
    (formData.role !== 'user' || formData.series_id)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {mode === 'edit' ? (
              <>
                <User className="h-4 w-4 mr-2" />
                Modifier
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Nouvel utilisateur
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {mode === 'edit' ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Modifiez les informations de cet utilisateur.'
              : 'Créez un nouveau compte utilisateur avec les informations requises.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={mode === 'edit'} // Don't allow email changes
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="full_name">Nom complet</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Nom et prénom"
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+221 XX XXX XX XX"
                />
              </div>

              <div>
                <Label htmlFor="date_of_birth">Date de naissance</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className={errors.date_of_birth ? 'border-red-500' : ''}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-red-600 mt-1">{errors.date_of_birth}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations du compte</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Rôle *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Étudiant</SelectItem>
                    <SelectItem value="member">Membre</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Statut *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                    <SelectItem value="deleted">Supprimé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="country_id">Pays *</Label>
                <Select 
                  value={formData.country_id} 
                  onValueChange={(value) => handleInputChange('country_id', value)}
                  disabled={loadingCountries}
                >
                  <SelectTrigger className={errors.country_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={loadingCountries ? "Chargement..." : "Sélectionnez un pays"} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.country_id}</p>
                )}
              </div>

              {formData.role === 'user' && (
                <div>
                  <Label htmlFor="series_id">Série *</Label>
                  <Select 
                    value={formData.series_id} 
                    onValueChange={(value) => handleInputChange('series_id', value)}
                    disabled={!formData.country_id || loadingSeries}
                  >
                    <SelectTrigger className={errors.series_id ? 'border-red-500' : ''}>
                      <SelectValue 
                        placeholder={
                          !formData.country_id 
                            ? "Sélectionnez d'abord un pays"
                            : loadingSeries 
                            ? "Chargement..." 
                            : "Sélectionnez une série"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {series.map((serie) => (
                        <SelectItem key={serie.id} value={serie.id}>
                          {serie.name} {serie.description && `- ${serie.description}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.series_id && (
                    <p className="text-sm text-red-600 mt-1">{errors.series_id}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {errors.form && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  {mode === 'edit' ? 'Modification...' : 'Création...'}
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'edit' ? 'Modifier' : 'Créer'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
