'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { UserStatusBadge } from '@/components/ui/status-badge'
import { createClient } from '@/lib/supabase'
import { useLoading } from '@/components/providers/loading-provider'
import type { ProfileWithDetails } from '@/types/database'

interface UserMenuProps {
  profile: ProfileWithDetails
}

export function UserMenu({ profile }: UserMenuProps) {
  const router = useRouter()
  const { startLoading } = useLoading()

  const handleSignOut = async () => {
    try {
      startLoading()
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
      // Loading will be stopped by navigation or error boundary
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
            <AvatarFallback>
              {profile.full_name?.split(' ').map(n => n[0]).join('') || 
               profile.email?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">
              {profile.full_name || 'Utilisateur'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.email}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {profile.country?.name} • {profile.role}
              </span>
              <UserStatusBadge status={profile.status} />
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/dashboard/profile" className="flex w-full items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
