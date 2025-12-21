'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import {
  Users,
  UserPlus,
  Mail,
  Loader2,
  Check,
  X,
  Clock,
  Trash2,
  RefreshCw,
  Heart,
  GraduationCap,
  BookOpen,
  User,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MentorInvite, MentorRelationship, MentorInviteStatus } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface MentorInviteCardProps {
  className?: string
}

const RELATIONSHIP_OPTIONS: { value: MentorRelationship; label: string; icon: React.ReactNode }[] = [
  { value: 'parent', label: 'Parent', icon: <Heart className="h-4 w-4" /> },
  { value: 'tutor', label: 'Tuteur', icon: <GraduationCap className="h-4 w-4" /> },
  { value: 'teacher', label: 'Professeur', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'mentor', label: 'Mentor', icon: <User className="h-4 w-4" /> },
  { value: 'other', label: 'Autre', icon: <MoreHorizontal className="h-4 w-4" /> },
]

const STATUS_CONFIG: Record<MentorInviteStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending: { label: 'En attente', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  accepted: { label: 'Acceptée', variant: 'default', icon: <Check className="h-3 w-3" /> },
  declined: { label: 'Refusée', variant: 'destructive', icon: <X className="h-3 w-3" /> },
  expired: { label: 'Expirée', variant: 'outline', icon: <Clock className="h-3 w-3" /> },
}

type InviteWithMentor = MentorInvite & {
  mentor_profile?: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null
}

export function MentorInviteCard({ className }: MentorInviteCardProps) {
  const [invites, setInvites] = useState<InviteWithMentor[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [deleteInviteId, setDeleteInviteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [mentorEmail, setMentorEmail] = useState('')
  const [mentorName, setMentorName] = useState('')
  const [relationship, setRelationship] = useState<MentorRelationship>('parent')
  const [canViewProgress, setCanViewProgress] = useState(true)
  const [canViewCourses, setCanViewCourses] = useState(true)
  const [canReceiveReports, setCanReceiveReports] = useState(false)

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/mentor-invites')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setInvites(data.sent || [])
    } catch (error) {
      console.error('Error fetching invites:', error)
      toast.error('Erreur lors du chargement des invitations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvites()
  }, [])

  const handleSendInvite = async () => {
    if (!mentorEmail.trim()) {
      toast.error('Veuillez entrer une adresse email')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/mentor-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_email: mentorEmail.trim(),
          mentor_name: mentorName.trim() || null,
          relationship,
          can_view_progress: canViewProgress,
          can_view_courses: canViewCourses,
          can_receive_reports: canReceiveReports,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }

      toast.success(data.message || 'Invitation envoyée !')
      setIsDialogOpen(false)
      resetForm()
      fetchInvites()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'invitation')
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteInvite = async () => {
    if (!deleteInviteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/mentor-invites?id=${deleteInviteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      toast.success('Invitation supprimée')
      setDeleteInviteId(null)
      fetchInvites()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const resetForm = () => {
    setMentorEmail('')
    setMentorName('')
    setRelationship('parent')
    setCanViewProgress(true)
    setCanViewCourses(true)
    setCanReceiveReports(false)
  }

  const getRelationshipLabel = (rel: MentorRelationship) => {
    return RELATIONSHIP_OPTIONS.find((r) => r.value === rel)?.label || rel
  }

  const acceptedMentors = invites.filter((i) => i.status === 'accepted')
  const pendingInvites = invites.filter((i) => i.status === 'pending')

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Mes mentors
              </CardTitle>
              <CardDescription>
                Invitez un parent, tuteur ou mentor à suivre vos progrès
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <UserPlus className="h-4 w-4" />
                  Inviter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Inviter un mentor</DialogTitle>
                  <DialogDescription>
                    Envoyez une invitation à un parent, tuteur ou professeur pour qu'il puisse suivre vos progrès.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="mentor-email">Adresse email *</Label>
                    <Input
                      id="mentor-email"
                      type="email"
                      placeholder="parent@example.com"
                      value={mentorEmail}
                      onChange={(e) => setMentorEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mentor-name">Nom (optionnel)</Label>
                    <Input
                      id="mentor-name"
                      placeholder="Ex: Papa, Mme Dupont..."
                      value={mentorName}
                      onChange={(e) => setMentorName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type de relation</Label>
                    <Select value={relationship} onValueChange={(v) => setRelationship(v as MentorRelationship)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              {option.icon}
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-medium">Permissions</Label>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Voir ma progression</Label>
                        <p className="text-xs text-muted-foreground">Accès aux statistiques et résultats</p>
                      </div>
                      <Switch checked={canViewProgress} onCheckedChange={setCanViewProgress} />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Voir mes cours</Label>
                        <p className="text-xs text-muted-foreground">Accès à la liste des cours suivis</p>
                      </div>
                      <Switch checked={canViewCourses} onCheckedChange={setCanViewCourses} />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Rapports hebdomadaires</Label>
                        <p className="text-xs text-muted-foreground">Recevoir un résumé par email</p>
                      </div>
                      <Switch checked={canReceiveReports} onCheckedChange={setCanReceiveReports} />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSendInvite} disabled={isSending}>
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-medium">Aucun mentor invité</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Invitez un parent ou tuteur pour qu'il puisse suivre vos progrès d'apprentissage.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Accepted mentors */}
              {acceptedMentors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Mentors actifs</p>
                  {acceptedMentors.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center gap-3 rounded-xl border bg-green-50/50 dark:bg-green-950/20 p-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={invite.mentor_profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(invite.mentor_name || invite.mentor_email)?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {invite.mentor_name || invite.mentor_profile?.full_name || invite.mentor_email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRelationshipLabel(invite.relationship)}
                        </p>
                      </div>
                      <Badge variant="default" className="gap-1 bg-green-600">
                        <Check className="h-3 w-3" />
                        Connecté
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending invites */}
              {pendingInvites.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">En attente</p>
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {(invite.mentor_name || invite.mentor_email)?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {invite.mentor_name || invite.mentor_email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Invité {formatDistanceToNow(new Date(invite.invited_at), { locale: fr, addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          En attente
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteInviteId(invite.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Declined/expired invites - collapsed */}
              {invites.filter((i) => i.status === 'declined' || i.status === 'expired').length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer text-xs font-medium uppercase text-muted-foreground hover:text-foreground">
                    Invitations refusées ou expirées ({invites.filter((i) => i.status === 'declined' || i.status === 'expired').length})
                  </summary>
                  <div className="mt-2 space-y-2">
                    {invites
                      .filter((i) => i.status === 'declined' || i.status === 'expired')
                      .map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center gap-3 rounded-xl border border-dashed p-3 opacity-60"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {(invite.mentor_name || invite.mentor_email)?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">
                              {invite.mentor_name || invite.mentor_email}
                            </p>
                          </div>
                          <Badge variant={STATUS_CONFIG[invite.status].variant} className="gap-1 text-xs">
                            {STATUS_CONFIG[invite.status].icon}
                            {STATUS_CONFIG[invite.status].label}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => {
                              setMentorEmail(invite.mentor_email)
                              setMentorName(invite.mentor_name || '')
                              setRelationship(invite.relationship)
                              setIsDialogOpen(true)
                            }}
                          >
                            <RefreshCw className="h-3 w-3" />
                            Renvoyer
                          </Button>
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteInviteId} onOpenChange={(open) => !open && setDeleteInviteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'invitation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action annulera l'invitation en attente. Vous pourrez en envoyer une nouvelle ultérieurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvite}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
