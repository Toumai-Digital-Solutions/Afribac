'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useLoading } from '@/components/providers/loading-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Save, AlertTriangle, Plus, Minus, Search, X } from 'lucide-react'
import { toast } from 'sonner'

interface Subject {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
}

interface SubjectAssociation {
  subject: Subject
  isAssociated: boolean
  coefficient: number
}

interface SeriesSubjectsManagerProps {
  seriesId: string
  initialSubjects: SubjectAssociation[]
}

export function SeriesSubjectsManager({ seriesId, initialSubjects }: SeriesSubjectsManagerProps) {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()
  const [subjects, setSubjects] = useState<SubjectAssociation[]>(initialSubjects)
  const [originalAssociations] = useState<SubjectAssociation[]>(JSON.parse(JSON.stringify(initialSubjects)))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'associated' | 'available'>('all')

  // Filtered and searched subjects
  const filteredSubjects = useMemo(() => {
    let filtered = subjects

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(item => 
        item.subject.name.toLowerCase().includes(search) ||
        item.subject.description?.toLowerCase().includes(search)
      )
    }

    // Apply association filter
    switch (filterType) {
      case 'associated':
        filtered = filtered.filter(item => item.isAssociated)
        break
      case 'available':
        filtered = filtered.filter(item => !item.isAssociated)
        break
      default:
        // 'all' - no additional filtering
        break
    }

    return filtered
  }, [subjects, searchTerm, filterType])

  const associatedCount = subjects.filter(s => s.isAssociated).length
  const availableCount = subjects.filter(s => !s.isAssociated).length
  const hasChanges = JSON.stringify(subjects) !== JSON.stringify(originalAssociations)

  const handleSubjectToggle = (subjectId: string, checked: boolean) => {
    setSubjects(prev => prev.map(item => 
      item.subject.id === subjectId 
        ? { ...item, isAssociated: checked }
        : item
    ))
  }

  const handleCoefficientChange = (subjectId: string, coefficient: number) => {
    if (coefficient < 1 || coefficient > 10) return
    
    setSubjects(prev => prev.map(item =>
      item.subject.id === subjectId
        ? { ...item, coefficient }
        : item
    ))
  }

  const getChanges = () => {
    const toAdd: { subject_id: string, coefficient: number }[] = []
    const toUpdate: { subject_id: string, coefficient: number }[] = []
    const toRemove: string[] = []

    subjects.forEach(current => {
      const original = originalAssociations.find(o => o.subject.id === current.subject.id)
      
      if (current.isAssociated && !original?.isAssociated) {
        // New association
        toAdd.push({
          subject_id: current.subject.id,
          coefficient: current.coefficient
        })
      } else if (!current.isAssociated && original?.isAssociated) {
        // Removed association
        toRemove.push(current.subject.id)
      } else if (current.isAssociated && original?.isAssociated && current.coefficient !== original.coefficient) {
        // Updated coefficient
        toUpdate.push({
          subject_id: current.subject.id,
          coefficient: current.coefficient
        })
      }
    })

    return { toAdd, toUpdate, toRemove }
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    setError('')
    startLoading()

    try {
      const supabase = createClient()
      const { toAdd, toUpdate, toRemove } = getChanges()

      // Remove associations
      if (toRemove.length > 0) {
        const { error } = await supabase
          .from('series_subjects')
          .delete()
          .eq('series_id', seriesId)
          .in('subject_id', toRemove)
        
        if (error) throw error
      }

      // Add new associations
      if (toAdd.length > 0) {
        const { error } = await supabase
          .from('series_subjects')
          .insert(toAdd.map(item => ({
            series_id: seriesId,
            subject_id: item.subject_id,
            coefficient: item.coefficient
          })))
        
        if (error) throw error
      }

      // Update existing associations
      for (const update of toUpdate) {
        const { error } = await supabase
          .from('series_subjects')
          .update({ coefficient: update.coefficient })
          .eq('series_id', seriesId)
          .eq('subject_id', update.subject_id)
        
        if (error) throw error
      }

      // Success
      const totalChanges = toAdd.length + toUpdate.length + toRemove.length
      toast.success(`${totalChanges} association${totalChanges > 1 ? 's' : ''} mise${totalChanges > 1 ? 's' : ''} à jour`)
      
      // Update original state to reflect current state
      const newOriginal = JSON.parse(JSON.stringify(subjects))
      router.refresh()

    } catch (error: any) {
      console.error('Error saving associations:', error)
      setError(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setIsSubmitting(false)
      stopLoading()
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setFilterType('all')
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span className="font-medium">
            {associatedCount} associée{associatedCount !== 1 ? 's' : ''} • {availableCount} disponible{availableCount !== 1 ? 's' : ''}
          </span>
        </div>
        {hasChanges && (
          <Badge variant="secondary">Modifications en attente</Badge>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une matière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-6 w-6 p-0 -translate-y-1/2"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            Toutes ({subjects.length})
          </Button>
          <Button
            variant={filterType === 'associated' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('associated')}
          >
            Associées ({associatedCount})
          </Button>
          <Button
            variant={filterType === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('available')}
          >
            Disponibles ({availableCount})
          </Button>
          
          {(searchTerm || filterType !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearSearch}>
              <X className="h-4 w-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || filterType !== 'all') && (
        <div className="text-sm text-muted-foreground">
          {filteredSubjects.length} résultat{filteredSubjects.length !== 1 ? 's' : ''} 
          {searchTerm && (
            <span> pour "{searchTerm}"</span>
          )}
          {filterType !== 'all' && (
            <span> ({filterType === 'associated' ? 'matières associées' : 'matières disponibles'})</span>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Subject List */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">
              {searchTerm || filterType !== 'all' 
                ? 'Aucune matière trouvée' 
                : 'Aucune matière disponible'
              }
            </p>
            {(searchTerm || filterType !== 'all') && (
              <Button variant="link" size="sm" onClick={clearSearch}>
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          filteredSubjects.map((item) => (
            <div 
              key={item.subject.id} 
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                item.isAssociated ? 'border-blue-200 bg-blue-50/50' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Checkbox
                  id={item.subject.id}
                  checked={item.isAssociated}
                  onCheckedChange={(checked) => 
                    handleSubjectToggle(item.subject.id, checked as boolean)
                  }
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={item.subject.id}
                    className="font-medium cursor-pointer block"
                  >
                    {item.subject.name}
                    {item.isAssociated && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Coeff. {item.coefficient}
                      </Badge>
                    )}
                  </label>
                  {item.subject.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                      {item.subject.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Coefficient Input */}
              {item.isAssociated && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Label className="text-sm whitespace-nowrap hidden sm:block">Coefficient:</Label>
                  <Label className="text-sm whitespace-nowrap sm:hidden">Coeff:</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                      onClick={() => handleCoefficientChange(item.subject.id, item.coefficient - 1)}
                      disabled={item.coefficient <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={item.coefficient}
                      onChange={(e) => handleCoefficientChange(item.subject.id, parseInt(e.target.value) || 1)}
                      className="w-16 h-8 text-center flex-shrink-0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                      onClick={() => handleCoefficientChange(item.subject.id, item.coefficient + 1)}
                      disabled={item.coefficient >= 10}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/admin/series/${seriesId}`}>
            Annuler
          </Link>
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Sauvegarde...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder les modifications
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
