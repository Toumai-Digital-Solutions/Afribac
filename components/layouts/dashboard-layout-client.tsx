'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { UserMenu } from './user-menu'
import { DashboardNavigation } from './dashboard-sidebar'
import { LoadingProvider } from '@/components/providers/loading-provider'
import type { ProfileWithDetails } from '@/types/database'

interface DashboardLayoutClientProps {
  profile: ProfileWithDetails
  children: React.ReactNode
}

export function DashboardLayoutClient({ profile, children }: DashboardLayoutClientProps) {
  return (
    <LoadingProvider>
      <div className="min-h-screen bg-background">
        <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-muted-foreground">Tableau de bord</span>
                <span className="text-base font-semibold text-foreground">Afribac</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserMenu profile={profile} />
            </div>
          </div>
          <div className="border-t border-border/60 bg-background/80">
            <DashboardNavigation profile={profile} />
          </div>
        </header>

        <main className="min-h-screen px-4 pb-10 pt-32 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </LoadingProvider>
  )
}
