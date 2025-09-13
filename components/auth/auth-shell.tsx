'use client'

import { ReactNode } from 'react'
import { BookOpen } from 'lucide-react'
import Lottie from "lottie-react";
import student from "../../public/lottie/student.json";
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
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

