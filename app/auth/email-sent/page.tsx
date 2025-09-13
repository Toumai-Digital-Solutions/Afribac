'use client'

import { useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { Loader2, Mail } from 'lucide-react'

function EmailSentContent() {
  const sp = useSearchParams()
  const email = useMemo(() => sp.get('email') || '', [sp])
  const supabase = createClient()
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const resend = async () => {
    if (!email) return
    setResending(true)
    setMessage('')
    setError('')
    try {
      // Supabase v2 resend signup email
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      setMessage("Email renvoyé. Vérifiez à nouveau votre boîte de réception.")
    } catch (e: any) {
      setError(e?.message || 'Impossible de renvoyer l’email')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthShell title="Vérifiez votre email" subtitle="Nous vous avons envoyé un lien de confirmation.">
      <div className="space-y-6">
        <div className="rounded-2xl border p-4 bg-muted/30 flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2"><Mail className="h-5 w-5 text-primary" /></div>
          <div className="text-sm">
            <p>
              {email ? (
                <>Un email de confirmation a été envoyé à <span className="font-medium">{email}</span>. Ouvrez le lien pour terminer la création de votre compte.</>
              ) : (
                <>Un email de confirmation a été envoyé. Ouvrez le lien pour terminer la création de votre compte.</>
              )}
            </p>
            <p className="text-muted-foreground mt-2">Si vous ne voyez rien, vérifiez votre dossier Spam.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-12 rounded-2xl">
            <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">Ouvrir Gmail</a>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-2xl">
            <a href="https://outlook.live.com" target="_blank" rel="noopener noreferrer">Ouvrir Outlook</a>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={resend} disabled={!email || resending} className="h-12 rounded-2xl">
            {resending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Renvoi…</>) : 'Renvoyer l’email'}
          </Button>
          <Button variant="ghost" asChild className="h-12 rounded-2xl">
            <a href="/auth/signin">Retour à la connexion</a>
          </Button>
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </AuthShell>
  )
}

export default function EmailSentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailSentContent />
    </Suspense>
  )
}