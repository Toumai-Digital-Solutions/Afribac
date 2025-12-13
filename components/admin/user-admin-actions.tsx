'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Ban, CheckCircle2, KeyRound } from 'lucide-react'

export function UserAdminActions({
  userId,
  userEmail,
  currentStatus,
  onDone
}: {
  userId: string
  userEmail: string
  currentStatus: 'active' | 'suspended' | 'deleted'
  onDone?: () => void
}) {
  const [loading, setLoading] = useState(false)

  const toggleStatus = async () => {
    if (currentStatus === 'deleted') return
    const next = currentStatus === 'active' ? 'suspended' : 'active'
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error
      toast.success(next === 'active' ? 'Utilisateur réactivé' : 'Utilisateur suspendu')
      onDone?.()
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de la mise à jour du statut')
    } finally {
      setLoading(false)
    }
  }

  const sendPasswordReset = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, { redirectTo })
      if (error) throw error
      toast.success('Email de réinitialisation envoyé')
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de l’envoi de l’email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={loading || currentStatus === 'deleted'}
        onClick={toggleStatus}
      >
        {currentStatus === 'active' ? (
          <>
            <Ban className="mr-2 h-4 w-4" />
            Suspendre
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Réactiver
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={sendPasswordReset}
      >
        <KeyRound className="mr-2 h-4 w-4" />
        Réinit. mot de passe
      </Button>
    </div>
  )
}


