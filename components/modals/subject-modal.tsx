'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLoading } from '@/components/providers/loading-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookOpen, Save, AlertTriangle, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface SubjectModalProps {
  initialData?: {
    id: string
    name: string
    description: string | null
  }
  mode?: 'create' | 'edit'
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function SubjectModal({ initialData, mode = 'create', trigger, onSuccess }: SubjectModalProps) {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la matière est requis'
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
      
      const subjectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      }

      let result
      if (mode === 'edit' && initialData?.id) {
        result = await supabase
          .from('subjects')
          .update(subjectData)
          .eq('id', initialData.id)
          .select()
          .single()
      } else {
        result = await supabase
          .from('subjects')
          .insert(subjectData)
          .select()
          .single()
      }

      if (result.error) {
        throw result.error
      }

      toast.success(
        mode === 'edit' 
          ? 'Matière modifiée avec succès' 
          : 'Matière créée avec succès'
      )
      
      setOpen(false)
      router.refresh()
      onSuccess?.()
      
      // Reset form for create mode
      if (mode === 'create') {
        setFormData({ name: '', description: '' })
      }
    } catch (error) {
      console.error('Error saving subject:', error)
      toast.error(
        mode === 'edit' 
          ? 'Erreur lors de la modification de la matière' 
          : 'Erreur lors de la création de la matière'
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
      Ajouter une matière
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
            <BookOpen className="h-5 w-5" />
            {mode === 'edit' ? 'Modifier la matière' : 'Nouvelle matière'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Modifiez les informations de la matière' 
              : 'Remplissez les informations pour créer une nouvelle matière'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la matière *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name')(e.target.value)}
              placeholder="Ex: Mathématiques"
              disabled={isSubmitting}
            />
            {errors.name && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.name}</AlertDescription>
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
              placeholder="Description de la matière..."
              rows={4}
              disabled={isSubmitting}
            />
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
