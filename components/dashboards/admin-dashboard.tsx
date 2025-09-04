"use client"

import { 
  Globe, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Server,
  AlertTriangle,
  Shield,
  BarChart3,
  UserCheck,
  Settings,
  Activity,
  MapPin
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AdminDashboardProps {
  adminName: string
}

// Mock data - in real app this would come from API
const globalStats = {
  totalUsers: 12847,
  activeCountries: 8,
  totalCourses: 456,
  systemHealth: 99.2
}

const countryStats = [
  { 
    country: "Sénégal", 
    code: "SN", 
    users: 4521, 
    growth: 12.5, 
    engagement: 84,
    members: 3,
    flag: "🇸🇳"
  },
  { 
    country: "Côte d'Ivoire", 
    code: "CI", 
    users: 3847, 
    growth: 8.3, 
    engagement: 78,
    members: 2,
    flag: "🇨🇮"
  },
  { 
    country: "Mali", 
    code: "ML", 
    users: 2156, 
    growth: 15.7, 
    engagement: 81,
    members: 2,
    flag: "🇲🇱"
  },
  { 
    country: "Burkina Faso", 
    code: "BF", 
    users: 1843, 
    growth: 6.2, 
    engagement: 75,
    members: 1,
    flag: "🇧🇫"
  },
  { 
    country: "Niger", 
    code: "NE", 
    users: 480, 
    growth: 22.1, 
    engagement: 72,
    members: 1,
    flag: "🇳🇪"
  }
]

const recentActivities = [
  {
    id: "1",
    type: "user_registered",
    description: "152 nouveaux utilisateurs inscrits",
    country: "Mali",
    timestamp: "Il y a 1h",
    status: "success"
  },
  {
    id: "2",
    type: "content_flagged", 
    description: "Cours 'Physique Quantique' signalé pour révision",
    country: "Sénégal",
    timestamp: "Il y a 3h",
    status: "warning"
  },
  {
    id: "3",
    type: "member_added",
    description: "Nouveau membre ajouté: Dr. Fatou Sarr",
    country: "Sénégal", 
    timestamp: "Il y a 6h",
    status: "success"
  },
  {
    id: "4",
    type: "system_update",
    description: "Mise à jour système déployée avec succès",
    country: "Global",
    timestamp: "Il y a 12h", 
    status: "info"
  }
]

const systemAlerts = [
  {
    id: "1",
    type: "performance",
    title: "Temps de réponse élevé",
    description: "Les serveurs en Côte d'Ivoire montrent une latence accrue",
    severity: "medium",
    timestamp: "Il y a 2h"
  },
  {
    id: "2",
    type: "content",
    title: "Contenu en attente de modération",
    description: "12 cours nécessitent une révision avant publication",
    severity: "low",
    timestamp: "Il y a 4h"
  },
  {
    id: "3", 
    type: "security",
    title: "Tentatives de connexion suspectes",
    description: "Activité inhabituelle détectée depuis plusieurs IP",
    severity: "high",
    timestamp: "Il y a 8h"
  }
]

const topPerformers = [
  { name: "Aminata Diallo", country: "Sénégal", series: "S2", score: 98.5 },
  { name: "Ousmane Traoré", country: "Mali", series: "S1", score: 96.2 },
  { name: "Fatoumata Kane", country: "Burkina Faso", series: "L", score: 95.8 },
  { name: "Ibrahim Koné", country: "Côte d'Ivoire", series: "S2", score: 94.7 }
]

export function AdminDashboard({ adminName }: AdminDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-success bg-success/10"
      case "warning": return "text-warning bg-warning/10"
      case "info": return "text-primary bg-primary/10"
      default: return "text-muted-foreground bg-muted/30"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive bg-destructive/10 border-destructive/20"
      case "medium": return "text-warning bg-warning/10 border-warning/20"
      default: return "text-muted-foreground bg-muted/10 border-muted/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Administration Globale
          </h1>
          <p className="text-muted-foreground">
            Bonjour {adminName}, voici l'état de la plateforme Afribac
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          <Button size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Monitoring
          </Button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +573 ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pays actifs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.activeCountries}</div>
            <p className="text-xs text-muted-foreground">
              Afrique de l'Ouest
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Toutes matières confondues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Santé système</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{globalStats.systemHealth}%</div>
            <Progress value={globalStats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Country Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Performance par pays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pays</TableHead>
                    <TableHead>Utilisateurs</TableHead>
                    <TableHead>Croissance</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryStats.map(stat => (
                    <TableRow key={stat.code}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{stat.flag}</span>
                          {stat.country}
                        </div>
                      </TableCell>
                      <TableCell>{stat.users.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-success" />
                          <span className="text-success">+{stat.growth}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={stat.engagement} className="w-16" />
                          <span className="text-sm">{stat.engagement}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{stat.members}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top performers globaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{performer.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{performer.country}</span>
                          <Badge variant="outline" className="text-xs">
                            Série {performer.series}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-success">{performer.score}%</div>
                      <p className="text-xs text-muted-foreground">Score moyen</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertes système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemAlerts.map(alert => (
                  <div key={alert.id} className={`p-3 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">{alert.title}</h4>
                      <p className="text-xs leading-tight">{alert.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {alert.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {alert.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full">
                  Voir toutes les alertes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getStatusColor(activity.status)}`}></div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm leading-tight">{activity.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.country}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Statistiques rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Membres actifs</span>
                <span className="text-sm font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cours en attente</span>
                <span className="text-sm font-medium text-warning">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rapports non lus</span>
                <span className="text-sm font-medium text-destructive">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Uptime serveur</span>
                <span className="text-sm font-medium text-success">99.9%</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <UserCheck className="h-4 w-4 mr-2" />
                Gérer les membres
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Globe className="h-4 w-4 mr-2" />
                Configurer les pays
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Modération contenu
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Rapports globaux
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
