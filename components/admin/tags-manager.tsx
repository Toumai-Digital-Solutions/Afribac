'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Tag {
  id: string
  name: string
  type: string
  color: string | null
  description: string | null
}

const TAG_TYPES = [
  { value: 'difficulty', label: 'Difficulté' },
  { value: 'exam_type', label: "Type d'examen" },
  { value: 'topic', label: 'Sujet' },
  { value: 'format', label: 'Format' },
  { value: 'special', label: 'Spécial' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'audience', label: 'Audience' },
  { value: 'approach', label: 'Approche' },
  { value: 'mode', label: 'Mode' },
  { value: 'duration', label: 'Durée' },
  { value: 'certification', label: 'Certification' }
]

const PRESET_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#06B6D4', '#22C55E', '#DC2626', '#F97316'
]

export function TagsManager({ initialTags }: { initialTags: Tag[] }) {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'topic',
    color: PRESET_COLORS[0],
    description: ''
  })

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'topic',
      color: PRESET_COLORS[0],
      description: ''
    })
    setEditingTag(null)
  }

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag)
      setFormData({
        name: tag.name,
        type: tag.type,
        color: tag.color || PRESET_COLORS[0],
        description: tag.description || ''
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      if (editingTag) {
        // Update existing tag
        const { error } = await supabase
          .from('tags')
          .update({
            name: formData.name,
            type: formData.type,
            color: formData.color,
            description: formData.description || null
          })
          .eq('id', editingTag.id)

        if (error) throw error

        setTags(tags.map(t => 
          t.id === editingTag.id 
            ? { ...t, ...formData, description: formData.description || null }
            : t
        ))
        toast.success('Tag mis à jour avec succès')
      } else {
        // Create new tag
        const { data, error } = await supabase
          .from('tags')
          .insert({
            name: formData.name,
            type: formData.type,
            color: formData.color,
            description: formData.description || null
          })
          .select()
          .single()

        if (error) throw error

        setTags([...tags, data])
        toast.success('Tag créé avec succès')
      }

      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error('Error saving tag:', error)
      toast.error('Erreur lors de la sauvegarde du tag')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (tagId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)

      if (error) throw error

      setTags(tags.filter(t => t.id !== tagId))
      toast.success('Tag supprimé avec succès')
      router.refresh()
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast.error('Erreur lors de la suppression du tag')
    } finally {
      setIsLoading(false)
    }
  }

  // Group tags by type
  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.type]) {
      acc[tag.type] = []
    }
    acc[tag.type].push(tag)
    return acc
  }, {} as Record<string, Tag[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {tags.length} tag{tags.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingTag ? 'Modifier le tag' : 'Créer un nouveau tag'}
                </DialogTitle>
                <DialogDescription>
                  Les tags aident à organiser et filtrer les cours
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Nouveau"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAG_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Couleur *</Label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description courte du tag"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingTag ? 'Mettre à jour' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tags grouped by type */}
      <div className="space-y-6">
        {Object.entries(groupedTags).map(([type, typeTags]) => {
          const typeLabel = TAG_TYPES.find(t => t.value === type)?.label || type
          
          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-lg">{typeLabel}</CardTitle>
                <CardDescription>
                  {typeTags.length} tag{typeTags.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Couleur</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typeTags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              borderColor: tag.color || undefined
                            }}
                          >
                            {tag.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className="h-6 w-6 rounded-full border"
                            style={{ backgroundColor: tag.color || '#000' }}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tag.description || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(tag)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(tag.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
