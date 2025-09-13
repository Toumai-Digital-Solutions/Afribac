'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signIn } from '@/lib/supabase/auth'
import { AlertCircle, Loader2, Mail, Lock } from 'lucide-react'
import { SocialAuthButtons } from '@/components/auth/social-auth'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthInput } from '@/components/auth/auth-input'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn({ email, password })

    if (error) {
      setError(error.message)
    } else {
      // Success
      window.location.href = '/auth/onboarding'
    }

    setLoading(false)
  }

  return (
    <AuthShell title="Howdy Campers 👋" subtitle="Apprenons ensemble maintenant.">
      <div className="space-y-6">
        <SocialAuthButtons mode="signin" />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Ou</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={setEmail}
            icon={<Mail className="h-4 w-4" />}
            name="email"
          />
          <AuthInput
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={setPassword}
            icon={<Lock className="h-4 w-4" />}
            name="password"
          />
          <Button type="submit" className="w-full h-12 rounded-2xl" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion…
              </>
            ) : (
              'Start learning'
            )}
          </Button>
        </form>

        {error && (
          <Alert className="border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Nouveau sur Afribac ? </span>
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}
