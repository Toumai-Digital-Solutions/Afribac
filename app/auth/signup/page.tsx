'use client'

import Link from 'next/link'
import { SocialAuthButtons } from '@/components/auth/social-auth'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthInput } from '@/components/auth/auth-input'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Lock } from 'lucide-react'
import { useState } from 'react'
import { signUp } from '@/lib/supabase/auth'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const { data, error } = await signUp({ email, password })
      if (error) {
        setError(error.message)
        return
      }

      if (data?.session) {
        window.location.href = '/auth/onboarding'
      } else {
        window.location.href = `/auth/email-sent?email=${encodeURIComponent(email)}`
      }
    } catch (err) {
      console.error('Supabase sign up failed', err)
      setError('Impossible de contacter le service d’authentification. Vérifiez votre connexion internet et la configuration Supabase, puis réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Créez votre compte" subtitle="Accédez aux contenus de votre pays.">
      <div className="space-y-6">
        <SocialAuthButtons mode="signup" />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Ou</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput type="email" placeholder="Adresse email" value={email} onChange={setEmail} icon={<Mail className="h-4 w-4" />} />
          <AuthInput type="password" placeholder="Mot de passe" value={password} onChange={setPassword} icon={<Lock className="h-4 w-4" />} />
          <Button type="submit" className="w-full h-12 rounded-2xl" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création…
              </>
            ) : (
              'Créer mon compte'
            )}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Déjà un compte ? </span>
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}
