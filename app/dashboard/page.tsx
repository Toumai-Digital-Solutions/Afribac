import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardRedirect() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // If no user, redirect to signin
  if (!user || error) {
    redirect('/auth/signin')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      country:countries(*),
      series:series(*)
    `)
    .eq('id', user.id)
    .single()

  // If no profile found, redirect to signin
  if (!profile) {
    redirect('/auth/signin')
  }

  // For now, we'll show a unified dashboard overview
  // In the future, this can show role-specific content or redirect to specific sections
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Bienvenue, {profile.full_name || 'Utilisateur'} 👋
          </h1>
          <p className="text-muted-foreground">
            {profile.role === 'admin' && 'Panneau d\'administration - Gestion globale'}
            {profile.role === 'member' && `Espace collaborateur - ${profile.country?.name}`}
            {profile.role === 'user' && `Espace étudiant - ${profile.series?.name || 'Apprentissage'}`}
          </p>
        </div>
      </div>

      {/* Role-specific quick actions or overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profile.role === 'admin' && (
          <>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Gestion globale</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Administrez tous les utilisateurs et contenus
              </p>
              <a href="/dashboard/admin" className="text-sm text-primary hover:underline">
                Accéder →
              </a>
            </div>
          </>
        )}
        
        {profile.role === 'member' && (
          <>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Mes contenus</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez et gérez vos cours
              </p>
              <a href="/dashboard/content" className="text-sm text-primary hover:underline">
                Accéder →
              </a>
            </div>
          </>
        )}
        
        {profile.role === 'user' && (
          <>
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Mes cours</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Continuez votre apprentissage
              </p>
              <a href="/dashboard/learn" className="text-sm text-primary hover:underline">
                Accéder →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
