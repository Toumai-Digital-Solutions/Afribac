'use client'

import Link from 'next/link'
import { RegistrationForm } from '@/components/auth/registration-form'
import { BookOpen } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Afribac</h1>
          <p className="text-muted-foreground">
            Rejoignez la plateforme éducative africaine
          </p>
        </div>

        {/* Registration Form */}
        <RegistrationForm />

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Déjà un compte? </span>
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
