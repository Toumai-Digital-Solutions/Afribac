'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  FileEdit,
  FileText,
  Globe,
  GraduationCap,
  Images,
  Menu,
  Play,
  Settings,
  Users,
  X
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

export const navigationItems: NavItem[] = [
  {
    title: 'Accueil',
    href: '/dashboard',
    icon: BarChart3,
    roles: ['admin', 'member', 'user']
  },
  {
    title: 'Contenu',
    icon: FileEdit,
    roles: ['member', 'admin'],
    children: [
      {
        title: 'Tous les cours',
        href: '/dashboard/content/courses',
        icon: BookOpen,
        roles: ['member', 'admin']
      },
      {
        title: 'Sujets',
        href: '/dashboard/content/exams',
        icon: FileText,
        roles: ['member', 'admin']
      },
      {
        title: 'Quiz & Exercices',
        href: '/dashboard/content/quiz',
        icon: FileText,
        roles: ['member', 'admin']
      },
      {
        title: 'Galerie',
        href: '/dashboard/gallery',
        icon: Images,
        roles: ['member', 'admin']
      }
    ]
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['member', 'admin', 'user']
  },
  {
    title: 'Administration',
    icon: Globe,
    roles: ['admin'],
    children: [
      {
        title: 'Pays',
        href: '/dashboard/admin/countries',
        icon: Globe,
        roles: ['admin']
      },
      {
        title: 'Séries',
        href: '/dashboard/admin/series',
        icon: FileText,
        roles: ['admin']
      },
      {
        title: 'Matières',
        href: '/dashboard/admin/subjects',
        icon: BookOpen,
        roles: ['admin']
      },
      {
        title: 'Utilisateurs',
        href: '/dashboard/admin/users',
        icon: Users,
        roles: ['admin']
      }
    ]
  },
  {
    title: 'Mes cours',
    href: '/student/courses',
    icon: GraduationCap,
    roles: ['user']
  },
  {
    title: 'Bibliothèque',
    href: '/student/library',
    icon: BookOpen,
    roles: ['user']
  },
  {
    title: 'Examens',
    href: '/student/exams',
    icon: FileText,
    roles: ['user']
  },
  {
    title: 'Simulation',
    href: '/student/simulation',
    icon: Play,
    roles: ['user']
  },
  {
    title: 'Mes progrès',
    href: '/student/progress',
    icon: BarChart3,
    roles: ['user']
  }
]

const buttonBase = 'h-9 rounded-full px-3 text-sm font-medium transition-colors'
const buttonInactive = 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
const buttonActive = 'bg-primary/10 text-primary hover:bg-primary/15'
const dropdownItemBase = 'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors'

const isActiveHref = (pathname: string, href?: string, isParent?: boolean) => {
  if (!href) return false
  if(isParent) return false
  if (href === '/dashboard') {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardSidebar({
  profile,
  isCollapsed,
  onToggle
}: {
  profile: ProfileWithDetails
  isCollapsed: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Contenu', 'Administration'])

  const availableItems = navigationItems.filter(item => item.roles.includes(profile.role))

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]
    )
  }

  const renderNavItem = (item: NavItem, isChild = false) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const isActive = hasChildren
      ? item.children!
          .filter(child => child.roles.includes(profile.role))
          .some(child => isActiveHref(pathname, child.href, hasChildren))
      : isActiveHref(pathname, item.href)

    if (hasChildren) {
      const visibleChildren = item.children!.filter(child => child.roles.includes(profile.role))
      if (visibleChildren.length === 0) return null

      return (
        <div key={item.title}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 h-10 text-left',
              isCollapsed && 'justify-center px-2',
              isActive && !isCollapsed && 'bg-muted font-medium'
            )}
            onClick={() => !isCollapsed && toggleExpanded(item.title)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 truncate">{item.title}</span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
              </>
            )}
          </Button>
          {!isCollapsed && (
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out pl-2',
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div className="ml-4 space-y-1 border-l border-dashed border-border/60 pl-4">
                {visibleChildren.map(child => renderNavItem(child, true))}
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <Link key={item.href} href={item.href!}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 h-10 transition-colors',
            isCollapsed && 'justify-center px-2',
            isChild && !isCollapsed && 'text-sm',
            !isCollapsed && isActive && 'bg-primary/10 text-primary hover:bg-primary/20',
            isCollapsed && isActive && 'text-primary'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="truncate">{item.title}</span>}
        </Button>
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden border-r bg-background transition-all duration-300 lg:flex',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full w-full flex-col">
        <div className={cn('flex items-center px-3 py-4', isCollapsed ? 'justify-center' : 'justify-between')}>
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Afribac</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
        <Separator />
        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            {availableItems.map(item => renderNavItem(item))}
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}

export function DashboardNavigation({
  profile,
  className
}: {
  profile: ProfileWithDetails
  className?: string
}) {
  const pathname = usePathname()
  const availableItems = navigationItems.filter(item => item.roles.includes(profile.role))

  return (
    <ScrollArea type="hover" className={cn('w-full', className)} scrollHideDelay={200}>
      <div className="flex items-center gap-1 pb-2 pr-6">
        {availableItems.map(item => {
          const Icon = item.icon
          const childItems = item.children?.filter(child => child.roles.includes(profile.role)) ?? []
          const isParentActive = childItems.length
            ? childItems.some(child => isActiveHref(pathname, child.href))
            : isActiveHref(pathname, item.href)

          if (childItems.length > 0) {
            return (
              <DropdownMenu key={item.title}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(buttonBase, isParentActive ? buttonActive : buttonInactive, 'justify-center gap-2')}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    <ChevronDown className="h-4 w-4" />
                    {item.badge ? (
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {childItems.map(child => {
                    const ChildIcon = child.icon
                    const isChildActive = isActiveHref(pathname, child.href)

                    return (
                      <DropdownMenuItem key={child.href} asChild className="focus:bg-muted">
                        <Link
                          href={child.href!}
                          className={cn(dropdownItemBase, isChildActive && 'bg-muted text-foreground')}
                        >
                          <ChildIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{child.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(buttonBase, isParentActive ? buttonActive : buttonInactive, 'gap-2')}
            >
              <Link href={item.href!}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              </Link>
            </Button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
