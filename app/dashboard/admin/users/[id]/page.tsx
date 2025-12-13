import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { UserModal } from '@/components/modals/user-modal'
import { UserAdminActions } from '@/components/admin/user-admin-actions'
import { ArrowLeft, Edit, Users, Mail, Phone, Calendar, Globe, GraduationCap, Shield, User } from 'lucide-react'
import Link from 'next/link'

interface UserDetailsPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const supabase = await createClient()

  // Check authentication and role
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !currentUser) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get user with detailed information
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select(`
      *,
      country:countries(*),
      series:series(*, country:countries(*))
    `)
    .eq('id', params.id)
    .single()

  if (userError || !user) {
    notFound()
  }

  // Get user statistics (if needed)
  const [
    { count: coursesStarted },
    { count: coursesCompleted },
    { data: progressTimeRows },
    { count: quizAttempts },
    { count: examAttempts }
  ] = await Promise.all([
    supabase.from('user_progress').select('course_id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('user_progress').select('course_id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_completed', true),
    supabase.from('user_progress').select('time_spent').eq('user_id', user.id),
    supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('exam_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
  ])

  const totalMinutes = (progressTimeRows || []).reduce((sum: number, row: any) => sum + (row.time_spent || 0), 0)
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return { 
          label: 'Administrateur', 
          icon: <Shield className="h-4 w-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200'
        }
      case 'member':
        return { 
          label: 'Membre', 
          icon: <Users className="h-4 w-4" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200'
        }
      case 'user':
        return { 
          label: 'Étudiant', 
          icon: <GraduationCap className="h-4 w-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200'
        }
      default:
        return { 
          label: role, 
          icon: <User className="h-4 w-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200'
        }
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          label: 'Actif', 
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200'
        }
      case 'suspended':
        return { 
          label: 'Suspendu', 
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200'
        }
      case 'deleted':
        return { 
          label: 'Supprimé', 
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200'
        }
      default:
        return { 
          label: status, 
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200'
        }
    }
  }

  const roleConfig = getRoleConfig(user.role)
  const statusConfig = getStatusConfig(user.status)

  return (
    <>
      <title>{user.full_name || user.email} - Afribac</title>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux utilisateurs
            </Link>
          </Button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.full_name || 'Utilisateur sans nom'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${roleConfig.bgColor} ${roleConfig.color} ${roleConfig.borderColor} border`}>
                {roleConfig.icon}
                <span className="ml-1">{roleConfig.label}</span>
              </Badge>
              <Badge className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}>
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {user.country.name}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <UserAdminActions
              userId={user.id}
              userEmail={user.email}
              currentStatus={user.status}
              onDone={() => {}}
            />
            <UserModal mode="edit" initialData={user} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Détails du profil utilisateur et informations de contact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nom complet</label>
                    <p className="text-gray-900 mt-1">{user.full_name || 'Non défini'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Téléphone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{user.phone || 'Non défini'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Date de naissance</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {user.date_of_birth ? 
                          new Date(user.date_of_birth).toLocaleDateString('fr-FR') : 
                          'Non définie'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Pays</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <p className="text-gray-900">{user.country.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {user.country.code}
                      </Badge>
                    </div>
                  </div>

                  {user.series && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Série</label>
                      <div className="flex items-center gap-2 mt-1">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-gray-900 font-medium">{user.series.name}</p>
                          {user.series.description && (
                            <p className="text-sm text-gray-500">{user.series.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  Informations du compte
                </CardTitle>
                <CardDescription>
                  Statut, rôle et dates importantes du compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rôle</label>
                    <div className="flex items-center gap-2 mt-1">
                      {roleConfig.icon}
                      <p className="text-gray-900 font-medium">{roleConfig.label}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Statut</label>
                    <p className="mt-1">
                      <Badge className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}>
                        {statusConfig.label}
                      </Badge>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Date d'inscription</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Dernière modification</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Edit className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {new Date(user.updated_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long', 
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques</CardTitle>
                <CardDescription>
                  Aperçu de l'activité utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cours suivis</span>
                    <span className="font-semibold">{coursesStarted || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cours terminés</span>
                    <span className="font-semibold">{coursesCompleted || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quiz complétés</span>
                    <span className="font-semibold">{quizAttempts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Simulations</span>
                    <span className="font-semibold">{examAttempts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Temps total</span>
                    <span className="font-semibold">{totalHours}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
                <CardDescription>
                  Gérer les éléments liés à cet utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {user.country && (
                    <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Link href={`/dashboard/admin/countries/${user.country.id}`}>
                        <Globe className="h-5 w-5" />
                        <span className="text-sm">Voir le pays</span>
                      </Link>
                    </Button>
                  )}
                  
                  {user.series && (
                    <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Link href={`/dashboard/admin/series/${user.series.id}`}>
                        <GraduationCap className="h-5 w-5" />
                        <span className="text-sm">Voir la série</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
