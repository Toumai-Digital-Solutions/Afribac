import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  BookOpen,
  Crown,
  UserCheck,
  GraduationCap,
  Lock,
  Eye,
  Mail,
  Clock,
  Languages,
  BarChart3,
  FileText,
  Database,
  UserCog,
  Palette,
  Save,
  AlertTriangle
} from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // If no user, redirect to signin
  if (!user || error) {
    redirect('/auth/signin')
  }

  // Get user profile with details
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

  const getRoleInfo = (role: string) => {
    switch(role) {
      case 'admin':
        return {
          label: 'Administrateur',
          icon: Crown,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        }
      case 'member':
        return {
          label: 'Collaborateur',
          icon: UserCheck,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        }
      default:
        return {
          label: 'Étudiant',
          icon: GraduationCap,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        }
    }
  }

  const roleInfo = getRoleInfo(profile.role)
  const RoleIcon = roleInfo.icon

  // Common settings component
  const GeneralSettings = () => (
    <div className="space-y-6 ">
     
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Gérez votre mot de passe et la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Changer le mot de passe
          </Button>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Authentification à deux facteurs</Label>
                <p className="text-sm text-muted-foreground">
                  Ajoutez une couche de sécurité supplémentaire
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configurez vos préférences de notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez des mises à jour importantes par email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications de nouveau cours</Label>
                <p className="text-sm text-muted-foreground">
                  Soyez notifié des nouveaux cours et examens
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Rappels d'étude</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez des rappels pour continuer vos études
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Préférences
          </CardTitle>
          <CardDescription>
            Langue et région
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Langue</Label>
              <Select defaultValue="fr">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <Select defaultValue="Europe/Paris">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                  <SelectItem value="Africa/Casablanca">Casablanca (UTC+1)</SelectItem>
                  <SelectItem value="Africa/Algiers">Alger (UTC+1)</SelectItem>
                  <SelectItem value="Africa/Tunis">Tunis (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Student-specific settings
  const StudentSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Préférences d'apprentissage
          </CardTitle>
          <CardDescription>
            Personnalisez votre expérience d'étude
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Matière préférée</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre matière préférée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathématiques</SelectItem>
                  <SelectItem value="physics">Physique</SelectItem>
                  <SelectItem value="chemistry">Chimie</SelectItem>
                  <SelectItem value="bio">Biologie</SelectItem>
                  <SelectItem value="history">Histoire</SelectItem>
                  <SelectItem value="french">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Niveau de difficulté préféré</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Mode sombre pour l'étude</Label>
                <p className="text-sm text-muted-foreground">
                  Réduire la fatigue oculaire lors de longues sessions
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Lecture automatique des cours</Label>
                <p className="text-sm text-muted-foreground">
                  Lancer automatiquement le contenu suivant
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Suivi des progrès
          </CardTitle>
          <CardDescription>
            Configurez le suivi de vos performances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Objectif d'étude quotidien</Label>
                <p className="text-sm text-muted-foreground">
                  Temps d'étude que vous souhaitez atteindre chaque jour
                </p>
              </div>
              <Select defaultValue="60">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                  <SelectItem value="120">2 heures</SelectItem>
                  <SelectItem value="180">3 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Rappels d'objectifs</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des rappels pour atteindre vos objectifs
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Statistiques détaillées</Label>
                <p className="text-sm text-muted-foreground">
                  Voir des analyses approfondies de vos performances
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Member-specific settings
  const MemberSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Création de contenu
          </CardTitle>
          <CardDescription>
            Préférences pour la création et gestion de cours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Format de contenu par défaut</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF avec notes</SelectItem>
                  <SelectItem value="video">Vidéo interactive</SelectItem>
                  <SelectItem value="mixed">Contenu mixte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-sauvegarde</Label>
                <p className="text-sm text-muted-foreground">
                  Sauvegarder automatiquement vos modifications
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Approbation automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Publier automatiquement vos cours après création
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Zone de collaboration</Label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="font-medium">{profile.country?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Vous créez du contenu pour cette région
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics et rapports
          </CardTitle>
          <CardDescription>
            Configurez vos préférences d'analyse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Rapports hebdomadaires</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir un résumé de l'engagement sur vos cours
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications de performance</Label>
                <p className="text-sm text-muted-foreground">
                  Être notifié quand vos cours atteignent des jalons
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Fréquence des rapports détaillés</Label>
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="quarterly">Trimestriel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Admin-specific settings
  const AdminSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuration système
          </CardTitle>
          <CardDescription>
            Paramètres globaux de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enregistrement automatique des nouveaux utilisateurs</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre l'inscription directe sans approbation
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mode maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le mode maintenance pour la plateforme
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Limite de stockage par utilisateur</Label>
              <Select defaultValue="500">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 MB</SelectItem>
                  <SelectItem value="500">500 MB</SelectItem>
                  <SelectItem value="1000">1 GB</SelectItem>
                  <SelectItem value="5000">5 GB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rétention des logs système</Label>
              <Select defaultValue="90">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                  <SelectItem value="180">6 mois</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Gestion des utilisateurs
          </CardTitle>
          <CardDescription>
            Paramètres de modération et de gestion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Modération automatique du contenu</Label>
                <p className="text-sm text-muted-foreground">
                  Filtrer automatiquement le contenu inapproprié
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications d'activité suspecte</Label>
                <p className="text-sm text-muted-foreground">
                  Être alerté des comportements inhabituels
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Période d'inactivité avant archivage</Label>
              <Select defaultValue="180">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">3 mois</SelectItem>
                  <SelectItem value="180">6 mois</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                  <SelectItem value="730">2 ans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Zone dangereuse
          </CardTitle>
          <CardDescription className="text-red-600/80">
            Actions irreversibles - procédez avec prudence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
              Réinitialiser les statistiques globales
            </Button>
            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
              Purger les données archivées
            </Button>
            <Button variant="destructive" className="w-full">
              Exporter toutes les données système
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez vos préférences et la configuration de votre compte
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${roleInfo.bgColor} ${roleInfo.color} border-0`}>
            <RoleIcon className="h-3 w-3 mr-1" />
            {roleInfo.label}
          </Badge>
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className={`grid w-full ${profile.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Général
          </TabsTrigger>
          
          {profile.role === 'user' && (
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Étudiant
            </TabsTrigger>
          )}
          
          {profile.role === 'member' && (
            <TabsTrigger value="member" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Collaborateur
            </TabsTrigger>
          )}
          
          {profile.role === 'admin' && (
            <>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Administration
              </TabsTrigger>
              
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Avancé
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        {profile.role === 'user' && (
          <TabsContent value="student">
            <StudentSettings />
          </TabsContent>
        )}

        {profile.role === 'member' && (
          <TabsContent value="member">
            <MemberSettings />
          </TabsContent>
        )}

        {profile.role === 'admin' && (
          <TabsContent value="admin">
            <AdminSettings />
          </TabsContent>
        )}

        {profile.role === 'admin' && (
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Paramètres avancés
                </CardTitle>
                <CardDescription>
                  Configuration technique et options avancées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mode développeur</Label>
                      <p className="text-sm text-muted-foreground">
                        Activer les outils de débogage et les logs détaillés
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Données de télémétrie</Label>
                      <p className="text-sm text-muted-foreground">
                        Partager des données d'usage anonymes pour améliorer la plateforme
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      Exporter mes données
                    </Button>
                    <Button variant="outline" className="w-full">
                      Vider le cache
                    </Button>
                    <Button variant="destructive" className="w-full">
                      Supprimer mon compte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
