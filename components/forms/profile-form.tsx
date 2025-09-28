'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Crown,
  UserCheck,
  GraduationCap,
  Globe,
  BookOpen,
  Camera,
  Edit,
  Save,
  X,
  Shield,
  Loader2,
  Upload,
  Check
} from 'lucide-react'
import { ImageEditor } from '@/components/ui/image-editor'
import { UserStatusBadge } from '@/components/ui/status-badge'
import type { ProfileWithDetails, Country, Series } from '@/types/database'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
  profile: ProfileWithDetails
  countries: Country[]
  series: Series[]
  targetUserId?: string // For admin/member editing other users
  isEditingOtherUser?: boolean
}

export function ProfileForm({ profile, countries, series, targetUserId, isEditingOtherUser = false }: ProfileFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  
  // Form data state
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    date_of_birth: profile.date_of_birth || '',
    country_id: profile.country_id,
    series_id: profile.series_id || '',
    avatar_url: profile.avatar_url || ''
  })

  const getRoleInfo = (role: string) => {
    switch(role) {
      case 'admin':
        return {
          label: 'Administrateur',
          icon: Crown,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          description: 'Accès complet à la gestion de la plateforme'
        }
      case 'member':
        return {
          label: 'Collaborateur',
          icon: UserCheck,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          description: 'Création et gestion de contenu éducatif'
        }
      default:
        return {
          label: 'Étudiant',
          icon: GraduationCap,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: 'Accès aux cours et examens'
        }
    }
  }

  const roleInfo = getRoleInfo(profile.role)
  const RoleIcon = roleInfo.icon

  // Filter series by selected country
  const availableSeries = series.filter(s => s.country_id === formData.country_id)

  const countryOptions: AutocompleteOption[] = countries
    .filter((country) => Boolean(country?.id))
    .map((country) => ({
      value: country.id,
      label: country.name,
      hint: country.code,
      leading: <Globe className="h-4 w-4 text-muted-foreground" />,
      trailing: country.code ? (
        <Badge variant="outline" className="font-mono text-xs">
          {country.code}
        </Badge>
      ) : undefined,
    }))

  const seriesOptions: AutocompleteOption[] = availableSeries
    .filter((serie) => Boolean(serie?.id))
    .map((serie) => ({
      value: serie.id,
      label: serie.name,
      hint: serie.description || undefined,
      leading: <GraduationCap className="h-4 w-4 text-muted-foreground" />,
    }))

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset series if country changes
      ...(field === 'country_id' && { series_id: '' })
    }))
  }

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 10MB')
      return
    }

    // Create URL for preview
    const imageUrl = URL.createObjectURL(file)
    setSelectedImageUrl(imageUrl)
    setPendingImageFile(file)
    setIsImageEditorOpen(true)
  }

  const handleImageEditorSave = async (editedImageBlob: Blob) => {
    setIsUploading(true)

    try {
      // Create a new File from the edited blob
      const editedFile = new File([editedImageBlob], pendingImageFile?.name || 'avatar.jpg', {
        type: 'image/jpeg',
      })

      const formData = new FormData()
      formData.append('file', editedFile)
      formData.append('bucket', 'avatars')
      
      // If editing another user, specify the target user ID
      if (targetUserId) {
        formData.append('targetUserId', targetUserId)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload')
      }

      const { url } = await response.json()
      
      setFormData(prev => ({
        ...prev,
        avatar_url: url
      }))

      toast.success('Avatar mis à jour avec succès')
      setIsImageEditorOpen(false)
      handleImageEditorCancel()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Erreur lors de l\'upload de l\'avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageEditorCancel = () => {
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
    }
    setSelectedImageUrl(null)
    setPendingImageFile(null)
    setIsImageEditorOpen(false)
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        // Clean up form data before sending
        const cleanedFormData = {
          ...formData,
          // Convert empty strings to undefined for optional fields
          phone: formData.phone.trim() || undefined,
          date_of_birth: formData.date_of_birth || undefined,
          full_name: formData.full_name.trim() || undefined,
        }

        const requestBody = {
          ...cleanedFormData,
          // If editing another user, specify the target user ID
          ...(targetUserId && { targetUserId })
        }

        const response = await fetch('/api/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde')
        }

        toast.success('Profil mis à jour avec succès')
        setIsEditing(false)
        router.refresh()
      } catch (error) {
        console.error('Save error:', error)
        toast.error('Erreur lors de la sauvegarde du profil')
      }
    })
  }

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      date_of_birth: profile.date_of_birth || '',
      country_id: profile.country_id,
      series_id: profile.series_id || '',
      avatar_url: profile.avatar_url || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditingOtherUser ? `Profil de ${formData.full_name || profile.email}` : 'Mon profil'}
          </h1>
          <p className="text-muted-foreground">
            {isEditingOtherUser 
              ? 'Gérez les informations de cet utilisateur' 
              : 'Gérez vos informations personnelles et votre compte'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isPending}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Sauvegarder
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.avatar_url} alt={formData.full_name || profile.email} />
                <AvatarFallback className="text-lg font-semibold">
                  {formData.full_name?.split(' ').map(n => n[0]).join('') || 
                   profile.email?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
              {!isEditing && (
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardTitle className="text-xl">
              {formData.full_name || 'Nom non défini'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {profile.email}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <UserStatusBadge status={profile.status} />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Role Information */}
              <div className={`flex items-center gap-3 p-3 rounded-lg ${roleInfo.bgColor}/20`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${roleInfo.bgColor}`}>
                  <RoleIcon className={`h-5 w-5 ${roleInfo.color}`} />
                </div>
                <div>
                  <p className="font-medium">{roleInfo.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {roleInfo.description}
                  </p>
                </div>
              </div>

              {/* Location & Series (if applicable) */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pays</p>
                    <p className="text-sm text-muted-foreground">
                      {countries.find(c => c.id === formData.country_id)?.name || 'Non défini'}
                    </p>
                  </div>
                </div>

                {profile.role === 'user' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100">
                      <BookOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Série</p>
                      <p className="text-sm text-muted-foreground">
                        {series.find(s => s.id === formData.series_id)?.name || 'Non assignée'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Account Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Membre depuis</span>
                  <span className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dernière mise à jour</span>
                  <span className="font-medium">
                    {new Date(profile.updated_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Vos informations de base et de contact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nom complet</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Votre nom complet"
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-muted/50' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    className="pr-10 bg-muted/50"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  L'email ne peut pas être modifié
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-muted/50 pr-10' : 'pr-10'}
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date de naissance</Label>
                <div className="relative">
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => {
                      // Only set valid dates, avoid empty strings
                      const dateValue = e.target.value
                      handleInputChange('date_of_birth', dateValue || '')
                    }}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-muted/50 pr-10' : 'pr-10'}
                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Country and Series Selection (editable based on role) */}
            {isEditing && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Autocomplete
                      value={formData.country_id || null}
                      onChange={(nextValue) => handleInputChange('country_id', nextValue)}
                      options={countryOptions}
                      placeholder="Sélectionnez un pays"
                      searchPlaceholder="Rechercher un pays..."
                      emptyText="Aucun pays trouvé"
                      disabled={profile.role === 'member'}
                    />
                    {profile.role === 'member' && (
                      <p className="text-xs text-muted-foreground">
                        Les collaborateurs ne peuvent pas changer de pays
                      </p>
                    )}
                  </div>
                  
                  {profile.role === 'user' && (
                    <div className="space-y-2">
                      <Label htmlFor="series">Série</Label>
                      <Autocomplete
                        value={formData.series_id || null}
                        onChange={(nextValue) => handleInputChange('series_id', nextValue)}
                        options={seriesOptions}
                        placeholder={
                          availableSeries.length === 0
                            ? 'Aucune série disponible'
                            : 'Sélectionnez une série'
                        }
                        searchPlaceholder="Rechercher une série..."
                        emptyText={
                          availableSeries.length === 0
                            ? 'Aucune série disponible pour ce pays'
                            : 'Aucune série trouvée'
                        }
                        disabled={availableSeries.length === 0}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Role-specific Information */}
            {profile.role === 'admin' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privilèges administrateur
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Gestion globale des utilisateurs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Configuration système</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Gestion des pays et séries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Accès à toutes les données</span>
                  </div>
                </div>
              </div>
            )}

            {profile.role === 'member' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-600 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Privilèges collaborateur
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Création de contenu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Gestion des cours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Accès aux analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Zone de collaboration: {countries.find(c => c.id === formData.country_id)?.name}</span>
                  </div>
                </div>
              </div>
            )}

            {profile.role === 'user' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Espace étudiant
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Accès aux cours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Simulation d'examens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Suivi des progrès</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Série: {series.find(s => s.id === formData.series_id)?.name || 'Non assignée'}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Editor Modal */}
      {selectedImageUrl && (
        <ImageEditor
          open={isImageEditorOpen}
          onOpenChange={setIsImageEditorOpen}
          imageSrc={selectedImageUrl}
          onSave={handleImageEditorSave}
          onCancel={handleImageEditorCancel}
          aspect={1} // Square aspect for avatars
        />
      )}
    </div>
  )
}
