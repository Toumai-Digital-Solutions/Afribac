'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, BookOpen } from 'lucide-react'

export default function DashboardRedirect() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Dashboard redirect - Loading:', loading, 'User:', !!user, 'Profile:', !!profile, 'Role:', profile?.role)
    
    if (!loading) {
      if (user && profile) {
        // Redirect based on role
        const targetRoute = profile.role === 'admin' ? '/admin/dashboard' 
                          : profile.role === 'member' ? '/member/dashboard'
                          : '/student/dashboard'
        
        console.log('Redirecting to:', targetRoute)
        router.replace(targetRoute)
      } else if (user && !profile) {
        // User exists but profile not loaded - wait a moment
        console.log('User exists but profile not loaded, waiting...')
        const timeout = setTimeout(() => {
          console.log('Profile still not loaded after timeout, redirecting to auth')
          router.replace('/auth/signin')
        }, 3000)
        
        return () => clearTimeout(timeout)
      } else if (!user) {
        // Not authenticated
        console.log('No user, redirecting to sign in')
        router.replace('/auth/signin')
      }
    }
  }, [user, profile, loading, router])

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <BookOpen className="h-12 w-12 animate-pulse text-primary" />
        </div>
        <div className="space-y-2">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          <p className="text-muted-foreground">
            Redirection vers votre tableau de bord...
          </p>
        </div>
      </div>
    </div>
  )
}
