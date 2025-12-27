'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { LoadingProvider } from '@/components/providers/loading-provider'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  GraduationCap,
  FileText,
  Play,
  BarChart3,
  Home,
  Library,
  Menu,
  X
} from 'lucide-react'
import { UserMenu } from './user-menu'
import { DashboardSidebar } from './dashboard-sidebar'
import type { ProfileWithDetails } from '@/types/database'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'

interface DashboardLayoutClientProps {
  profile: ProfileWithDetails
  children: React.ReactNode
}

// Student navigation items for bottom tab bar
const studentNavItems = [
  { title: 'Accueil', href: '/dashboard', icon: Home },
  { title: 'Cours', href: '/student/courses', icon: GraduationCap },
  { title: 'Examens', href: '/student/exams', icon: FileText },
  { title: 'Simulation', href: '/student/simulation', icon: Play },
  { title: 'Stats', href: '/student/mastery', icon: BarChart3 }
]

// Additional menu items for the slide-out menu
const studentMenuItems = [
  { title: 'Accueil', href: '/dashboard', icon: Home },
  { title: 'Mes cours', href: '/student/courses', icon: GraduationCap },
  { title: 'Bibliothèque', href: '/student/library', icon: Library },
  { title: 'Examens', href: '/student/exams', icon: FileText },
  { title: 'Simulation', href: '/student/simulation', icon: Play },
  { title: 'Mes statistiques', href: '/student/mastery', icon: BarChart3 }
]

function isActiveHref(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardLayoutClient({ profile, children }: DashboardLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isStudent = profile.role === 'user'

  if (isStudent) {
    return (
      <LoadingProvider>
        <div className="min-h-screen bg-background pb-20 md:pb-0">
          {/* Header */}
          <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
              {/* Left: Logo */}
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold text-foreground">Afribac</span>
              </Link>

              {/* Center: Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {studentMenuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveHref(pathname, item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserMenu profile={profile} />
                
                {/* Mobile Menu Button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] p-0">
                    <SheetHeader className="border-b px-4 py-4">
                      <SheetTitle className="flex items-center gap-2 text-left">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <span>Menu</span>
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col p-4">
                      {studentMenuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = isActiveHref(pathname, item.href)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        )
                      })}
                    </nav>
                    
                    {/* User Info in Mobile Menu */}
                    <div className="absolute bottom-0 left-0 right-0 border-t bg-muted/30 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {profile.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{profile.full_name || 'Utilisateur'}</p>
                          <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="min-h-screen px-4 pb-6 pt-16 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
            <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
              {studentNavItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveHref(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all min-w-[60px]',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                        isActive && 'bg-primary/10'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
                    </div>
                    <span className="text-[10px] font-medium">{item.title}</span>
                  </Link>
                )
              })}
            </div>
            {/* Safe area padding for iOS */}
            <div className="h-safe-area-inset-bottom bg-background" />
          </nav>
        </div>
      </LoadingProvider>
    )
  }

  // Admin/Member Layout (unchanged)
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
