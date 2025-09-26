'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  FileEdit,
  FileText,
  Globe,
  GraduationCap,
  Images,
  Play,
  Settings,
  Users
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

const buttonBase = 'h-10 rounded-full px-4 text-sm font-medium transition-colors'
const buttonInactive = 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
const buttonActive = 'bg-primary/10 text-primary hover:bg-primary/20'

const dropdownItemBase = 'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm'

const isActiveHref = (pathname: string, href?: string) => {
  if (!href) return false
  if (href === '/dashboard') {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardNavigation({ profile }: { profile: ProfileWithDetails }) {
  const pathname = usePathname()

  const availableItems = navigationItems.filter(item => item.roles.includes(profile.role))

  return (
    <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3">
      {availableItems.map(item => {
        const Icon = item.icon
        const isParentActive = item.children
          ? item.children
              .filter(child => child.roles.includes(profile.role))
              .some(child => isActiveHref(pathname, child.href))
          : isActiveHref(pathname, item.href)

        if (item.children && item.children.some(child => child.roles.includes(profile.role))) {
          const childItems = item.children.filter(child => child.roles.includes(profile.role))

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
  )
}

export { navigationItems }
