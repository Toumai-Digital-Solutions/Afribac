'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

function parseHashParams(hash: string) {
  const clean = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(clean)
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    type: params.get('type'),
  }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  const canSubmit = useMemo(() => {
    return password.length >= 8 && password === confirm && !saving && isReady
  }, [password, confirm, saving, isReady])

  useEffect(() => {
    const supabase = createClient()
    const { access_token, refresh_token, type } = parseHashParams(window.location.hash || '')

    if (!access_token || !refresh_token || type !== 'recovery') {
      setSessionError('Lien de réinitialisation invalide ou expiré.')
      setIsReady(false)
      return
    }

    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) {
          setSessionError('Impossible de valider la session de récupération.')
          setIsReady(false)
          return
        }
        setSessionError(null)
        setIsReady(true)
        // Clean URL hash
        window.history.replaceState(null, '', window.location.pathname)
      })
      .catch(() => {
        setSessionError('Impossible de valider la session de récupération.')
        setIsReady(false)
      })
  }, [])

  const updatePassword = async () => {
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Mot de passe mis à jour. Vous pouvez vous connecter.')
      router.push('/auth/signin')
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de la mise à jour du mot de passe.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Réinitialiser le mot de passe</CardTitle>
          <CardDescription>Choisissez un nouveau mot de passe pour votre compte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionError ? (
            <Alert variant="destructive">
              <AlertDescription>{sessionError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              disabled={!isReady || saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmer</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="********"
              disabled={!isReady || saving}
            />
          </div>

          <Button className="w-full" onClick={updatePassword} disabled={!canSubmit}>
            {saving ? 'Mise à jour…' : 'Mettre à jour'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


