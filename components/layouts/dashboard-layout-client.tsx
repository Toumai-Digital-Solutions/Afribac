'use client'

import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { BookOpen, Menu } from 'lucide-react'
import Link from 'next/link'
import { UserMenu } from './user-menu'
import { DashboardSidebar } from './dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LoadingProvider } from '@/components/providers/loading-provider'
import type { ProfileWithDetails } from '@/types/database'

interface DashboardLayoutClientProps {
  profile: ProfileWithDetails
  children: React.ReactNode
}

export function DashboardLayoutClient({ profile, children }: DashboardLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <LoadingProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto h-16 px-4 flex items-center justify-between">
          {/* Left side - Logo and Toggle */}
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Afribac</span>
            </Link>
          </div>

          {/* Right side - Theme Toggle and User Menu */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserMenu profile={profile} />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <DashboardSidebar 
        profile={profile} 
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content */}
      <main className={cn(
        "pt-16 min-h-screen transition-all duration-300",
        isCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        <div className="p-6">
          {children}
        </div>
      </main>
      </div>
    </LoadingProvider>
  )
}
