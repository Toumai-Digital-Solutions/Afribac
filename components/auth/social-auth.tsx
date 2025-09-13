'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { signInWithProvider } from '@/lib/supabase/auth'

interface SocialAuthButtonsProps {
  mode?: 'signin' | 'signup'
}

export function SocialAuthButtons({ mode = 'signin' }: SocialAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<null | 'google' | 'apple' | 'facebook'>(null)

  const handleProvider = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      setLoadingProvider(provider)
      await signInWithProvider(provider, '/auth/onboarding')
    } finally {
      // The browser will usually redirect immediately; this is a safeguard
      setLoadingProvider(null)
    }
  }

  const action = mode === 'signup' ? 'Créer un compte' : 'Continuer'

  return (
    <div className="grid grid-cols-3 gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-2xl"
        onClick={() => handleProvider('google')}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'google' ? '...' : 'Google'}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-2xl"
        onClick={() => handleProvider('apple')}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'apple' ? '...' : 'Apple'}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-2xl"
        onClick={() => handleProvider('facebook')}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'facebook' ? '...' : 'Facebook'}
      </Button>
    </div>
  )
}
