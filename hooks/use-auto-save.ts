'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { toast } from 'sonner'

interface UseAutoSaveOptions {
  data: any
  onSave: (data: any) => Promise<void>
  delay?: number
  enabled?: boolean
}

interface UseAutoSaveReturn {
  isSaving: boolean
  lastSaved: Date | null
  forceSave: () => Promise<void>
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

export function useAutoSave({
  data,
  onSave,
  delay = 3000, // 3 seconds
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastDataRef = useRef<string>()
  const isInitialRender = useRef(true)

  const save = useCallback(async () => {
    if (!enabled || !data) return

    setIsSaving(true)
    setSaveStatus('saving')
    
    try {
      await onSave(data)
      setLastSaved(new Date())
      setSaveStatus('saved')
      
      // Reset to idle after showing saved status
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Auto-save error:', error)
      setSaveStatus('error')
      toast.error('Erreur lors de la sauvegarde automatique')
      
      // Reset to idle after showing error
      setTimeout(() => {
        setSaveStatus('idle')
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }, [data, onSave, enabled])

  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await save()
  }, [save])

  useEffect(() => {
    if (!enabled || !data) return

    // Don't auto-save on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false
      lastDataRef.current = JSON.stringify(data)
      return
    }

    const currentData = JSON.stringify(data)
    
    // Only save if data has actually changed
    if (currentData === lastDataRef.current) {
      return
    }

    lastDataRef.current = currentData

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      save()
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, save, delay, enabled])

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving || saveStatus === 'saving') {
        e.preventDefault()
        e.returnValue = 'Sauvegarde en cours... Voulez-vous vraiment quitter ?'
        return e.returnValue
      }
      
      // Check if there are unsaved changes
      const currentData = JSON.stringify(data)
      if (currentData !== lastDataRef.current && enabled && data) {
        e.preventDefault()
        e.returnValue = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isSaving, saveStatus, data, enabled])

  return {
    isSaving,
    lastSaved,
    forceSave,
    saveStatus,
  }
}
