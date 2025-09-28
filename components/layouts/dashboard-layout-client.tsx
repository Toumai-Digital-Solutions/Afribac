'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { LoadingProvider } from '@/components/providers/loading-provider'
import { cn } from '@/lib/utils'
import { BookOpen, Menu } from 'lucide-react'
import { UserMenu } from './user-menu'
import { DashboardSidebar, DashboardNavigation } from './dashboard-sidebar'
import type { ProfileWithDetails } from '@/types/database'

interface DashboardLayoutClientProps {
  profile: ProfileWithDetails
  children: React.ReactNode
}

export function DashboardLayoutClient({ profile, children }: DashboardLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isStudent = profile.role === 'user'

  if (isStudent) {
    return (
      <LoadingProvider>
        <div className="min-h-screen bg-background">
          <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="hidden flex-col leading-tight md:flex">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tableau de bord
                  </span>
                  <span className="text-base font-semibold text-foreground">Afribac</span>
                </div>
              </Link>

              <div className="hidden flex-1 items-center justify-center lg:flex">
                <DashboardNavigation profile={profile} className="w-full" />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <UserMenu profile={profile} />
              </div>
            </div>
            <div className="border-t border-border/60 bg-background/80 lg:hidden">
              <DashboardNavigation profile={profile} className="px-4 py-2" />
            </div>
          </header>

          <main className="min-h-screen px-4 pb-10 pt-28 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </LoadingProvider>
    )
  }

  return (
    <LoadingProvider>
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsCollapsed(previous => !previous)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Link href="/dashboard" className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Afribac</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserMenu profile={profile} />
            </div>
          </div>
        </header>

        <DashboardSidebar
          profile={profile}
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(previous => !previous)}
        />

        <main
          className={cn(
            'pt-16 min-h-screen transition-all duration-300',
            isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          )}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </LoadingProvider>
  )
}
