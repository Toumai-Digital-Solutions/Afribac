'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  Users, 
  FileEdit, 
  BarChart3, 
  Settings, 
  GraduationCap,
  Crown,
  UserCheck,
  FileText,
  Play,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  UserCog,
  Globe
} from 'lucide-react'
import type { ProfileWithDetails } from '@/types/database'

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  badge?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  // Common Navigation
  {
    title: 'Vue d\'ensemble',
    href: '/dashboard',
    icon: BarChart3,
    roles: ['admin', 'member', 'user'],
  },
  
  // Admin & Member Navigation
  {
    title: 'Contenu',
    icon: FileEdit,
    roles: ['member', 'admin'],
    children: [
      {
        title: 'Tous les cours',
        href: '/dashboard/content/courses',
        icon: BookOpen,
        roles: ['member', 'admin'],
      },

      {
        title: 'Sujets',
        href: '/dashboard/content/exams',
        icon: FileText,
        roles: ['member', 'admin'],
      },

      {
        title: 'Quiz & Exercices',
        href: '/dashboard/content/quiz',
        icon: FileText,
        roles: ['member', 'admin'],
      },
    ]
  },

  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['member', 'admin'],
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['member', 'admin', 'user'],
  },
  
  // Admin Only Navigation
  {
    title: 'Administration',
    icon: Globe,
    roles: ['admin'],
    children: [
      {
        title: 'Vue d\'ensemble',
        href: '/dashboard/admin/overview',
        icon: BarChart3,
        roles: ['admin'],
      },
      {
        title: 'Pays',
        href: '/dashboard/admin/countries',
        icon: Globe,
        roles: ['admin'],
      },
      {
        title: 'Séries',
        href: '/dashboard/admin/series',
        icon: FileText,
        roles: ['admin'],
      },
      {
        title: 'Matières',
        href: '/dashboard/admin/subjects',
        icon: BookOpen,
        roles: ['admin'],
      },
      {
        title: 'Utilisateurs',
        href: '/dashboard/admin/users',
        icon: Users,
        roles: ['admin'],
      },
    ]
  },

  // Student Navigation
  {
    title: 'Mes cours',
    href: '/dashboard/learn',
    icon: GraduationCap,
    roles: ['user'],
  },
  {
    title: 'Bibliothèque',
    href: '/dashboard/learn/library',
    icon: BookOpen,
    roles: ['user'],
  },
  {
    title: 'Examens',
    href: '/dashboard/learn/exams',
    icon: FileText,
    roles: ['user'],
  },
  {
    title: 'Simulation',
    href: '/dashboard/learn/simulation',
    icon: Play,
    roles: ['user'],
  },
  {
    title: 'Mes progrès',
    href: '/dashboard/learn/progress',
    icon: BarChart3,
    roles: ['user'],
  },
]

interface DashboardSidebarProps {
  profile: ProfileWithDetails
  isCollapsed: boolean
  onToggle: () => void
}

export function DashboardSidebar({ profile, isCollapsed, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Contenu', 'Administration']) // Default expanded

  // Filter navigation items based on user role
  const availableItems = navigationItems.filter(item => 
    item.roles.includes(profile.role)
  )

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const renderNavItem = (item: NavItem, isChild = false) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const isActive = item.href ? (pathname === item.href || 
      (item.href !== '/dashboard' && pathname.startsWith(item.href))) : false

    if (hasChildren) {
      return (
        <div key={item.title}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-10 transition-all duration-150",
              isCollapsed && "justify-center px-2",
              "hover:bg-accent/50"
            )}
            onClick={() => !isCollapsed && toggleExpanded(item.title)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left">{item.title}</span>
                <div className={cn(
                  "transition-transform duration-200 ease-in-out",
                  isExpanded && "rotate-180"
                )}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </>
            )}
          </Button>
          
          {/* Children */}
          {!isCollapsed && item.children && (
            <div 
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="relative mt-1 space-y-1">
                {/* Vertical connector line */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-border/50" />
                
                <div className="ml-6 space-y-1">
                  {item.children
                    .filter(child => child.roles.includes(profile.role))
                    .map((child, index) => (
                      <div key={child.href} className="relative">
                        {/* Horizontal connector line */}
                        <div className="absolute left-[-12px] top-1/2 w-3 h-px bg-border/50 -translate-y-1/2" />
                        {renderNavItem(child, true)}
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <Link key={item.href} href={item.href!}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 h-10 transition-all duration-150",
            isCollapsed && "justify-center px-2",
            isActive && "bg-secondary",
            isChild && "h-9 text-sm hover:bg-secondary/50"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <span className="truncate">{item.title}</span>
          )}
          {!isCollapsed && item.badge && (
            <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
              {item.badge}
            </span>
          )}
        </Button>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300",
        isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "w-64"
      )}>
        <div className="flex h-full flex-col">
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {availableItems.map(item => renderNavItem(item))}
            </div>

            {/* Role indicator */}
            {!isCollapsed && (
              <>
                <Separator className="my-4" />
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {profile.role === 'admin' && <Crown className="h-4 w-4" />}
                    {profile.role === 'member' && <UserCheck className="h-4 w-4" />}
                    {profile.role === 'user' && <GraduationCap className="h-4 w-4" />}
                    <span className="capitalize">
                      {profile.role === 'admin' ? 'Administrateur' : 
                       profile.role === 'member' ? 'Collaborateur' : 'Étudiant'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {profile.country?.name}
                  </div>
                </div>
              </>
            )}
          </ScrollArea>
        </div>
      </aside>
    </>
  )
}
