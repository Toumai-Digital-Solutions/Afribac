'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { AuthInput } from '@/components/auth/auth-input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function NameForm() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')
      const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
      if (error) throw error
      window.location.href = '/auth/onboarding'
    } catch (e: any) {
      setError(e?.message || 'Échec de l’enregistrement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <AuthInput type="text" placeholder="Nom complet" value={name} onChange={setName} />
      <Button type="submit" className="w-full h-12 rounded-2xl" disabled={!name || saving}>
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement…
          </>
        ) : (
          'Continuer'
        )}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  )
}

