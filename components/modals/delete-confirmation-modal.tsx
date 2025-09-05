'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLoading } from '@/components/providers/loading-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, AlertTriangle, Type } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteConfirmationModalProps {
  resourceType: 'country' | 'series' | 'subject' | 'user'
  resourceName: string
  resourceId: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  disabled?: boolean
  dependencies?: {
    series?: number
    subjects?: number
    courses?: number
    users?: number
  }
}

const resourceConfig = {
  country: {
    singular: 'pays',
    plural: 'pays',
    table: 'countries',
    dependencies: ['series', 'profiles'],
    warningMessage: 'Attention : Supprimer ce pays supprimera également toutes les séries associées et déplacera les utilisateurs.'
  },
  series: {
    singular: 'série',
    plural: 'séries', 
    table: 'series',
    dependencies: ['profiles', 'series_subjects'],
    warningMessage: 'Attention : Supprimer cette série déplacera les étudiants associés.'
  },
  subject: {
    singular: 'matière',
    plural: 'matières',
    table: 'subjects', 
    dependencies: ['series_subjects', 'courses'],
    warningMessage: 'Attention : Supprimer cette matière supprimera toutes les associations avec les séries et les cours.'
  },
  user: {
    singular: 'utilisateur',
    plural: 'utilisateurs',
    table: 'profiles',
    dependencies: ['user_progress', 'courses'],
    warningMessage: 'Attention : Supprimer cet utilisateur supprimera également tous ses progrès et données associées.'
  }
}

export function DeleteConfirmationModal({ 
  resourceType, 
  resourceName, 
  resourceId, 
  trigger, 
  onSuccess,
  disabled = false,
  dependencies = {}
}: DeleteConfirmationModalProps) {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()
  const [open, setOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const config = resourceConfig[resourceType]
  const isConfirmationValid = confirmationText === resourceName
  const hasDependencies = Object.values(dependencies).some(count => count && count > 0)

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      setError('Veuillez taper exactement le nom de la ressource')
      return
    }

    setIsDeleting(true)
    setError('')
    startLoading()

    try {
      const supabase = createClient()
      
      // Delete the resource
      const { error: deleteError } = await supabase
        .from(config.table)
        .delete()
        .eq('id', resourceId)

      if (deleteError) {
        throw deleteError
      }

      // Success
      toast.success(`${config.singular.charAt(0).toUpperCase() + config.singular.slice(1)} "${resourceName}" supprimé(e) avec succès`)
      setOpen(false)
      setConfirmationText('')
      
      // Call success callback or refresh
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }

    } catch (error: any) {
      console.error('Error deleting resource:', error)
      
      // Handle specific database errors
      if (error.code === '23503') {
        setError(`Impossible de supprimer ce ${config.singular} car il est encore utilisé par d'autres éléments.`)
      } else {
        setError(error.message || `Erreur lors de la suppression du ${config.singular}`)
      }
    } finally {
      setIsDeleting(false)
      stopLoading()
    }
  }

  const dependencySummary = []
  if (dependencies.series) dependencySummary.push(`${dependencies.series} série${dependencies.series > 1 ? 's' : ''}`)
  if (dependencies.subjects) dependencySummary.push(`${dependencies.subjects} matière${dependencies.subjects > 1 ? 's' : ''}`)
  if (dependencies.courses) dependencySummary.push(`${dependencies.courses} cours`)
  if (dependencies.users) dependencySummary.push(`${dependencies.users} utilisateur${dependencies.users > 1 ? 's' : ''}`)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="sm"
            disabled={disabled}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Supprimer {config.singular}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Vous êtes sur le point de supprimer le {config.singular} :
              </p>
              
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="font-medium text-red-800">"{resourceName}"</p>
              </div>

              {hasDependencies && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {config.warningMessage}
                    {dependencySummary.length > 0 && (
                      <>
                        <br />
                        <strong>Éléments liés :</strong> {dependencySummary.join(', ')}
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmation" className="text-sm font-medium">
                  <Type className="h-4 w-4 inline mr-1" />
                  Tapez <code className="bg-gray-100 px-1 rounded">{resourceName}</code> pour confirmer :
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => {
                    setConfirmationText(e.target.value)
                    setError('')
                  }}
                  placeholder={resourceName}
                  className={error ? 'border-red-500' : ''}
                  disabled={isDeleting}
                />
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Annuler
          </AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
            className="min-w-[100px]"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Suppression...
              </div>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
