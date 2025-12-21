'use client'

import { ReactNode } from 'react'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Lottie from "lottie-react";
import student from "../../public/lottie/student.json";
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  currentStep?: number
  totalSteps?: number
  backHref?: string
}

export function AuthShell({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  backHref,
}: AuthShellProps) {
  const router = useRouter()
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left: marketing / illustration */}
      <div className="hidden md:flex flex-col bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        </div>
        <div className="p-8 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="font-semibold">Afribac</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
         
          <Lottie animationData={student} loop={true} />
          
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Devenez excellent, un cours à la fois
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md">
            Contenu aligné aux programmes nationaux, exercices interactifs et préparation aux examens.
          </p>

        </div>
        <div className="p-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Afribac. Tous droits réservés.
        </div>
      </div>

      {/* Right: auth panel */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md">
          {/* Progress indicator */}
          {currentStep && totalSteps && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Étape {currentStep} sur {totalSteps}
                </span>
                <span className="text-sm font-medium text-primary">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Back button */}
          {backHref && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => router.push(backHref)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          )}

          <div className="mb-6">
            <h1 className="text-3xl font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

