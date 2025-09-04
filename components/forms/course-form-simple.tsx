"use client"

import { useState } from "react"
import { 
  BookOpen, 
  Save, 
  Eye, 
  Plus, 
  X,
  Clock,
  Target,
  Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "./file-upload"

interface CourseFormData {
  title: string
  description: string
  content: string
  subjectId: string
  difficultyLevel: number
  estimatedDuration: number
  isPublished: boolean
  tags: string[]
}

interface CourseFormSimpleProps {
  initialData?: Partial<CourseFormData>
  onSubmit: (data: CourseFormData, pdfFile?: File) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

const subjects = [
  { id: "math", name: "Mathématiques", icon: "🔢" },
  { id: "physics", name: "Physique", icon: "⚛️" },
  { id: "chemistry", name: "Chimie", icon: "🧪" },
  { id: "biology", name: "Biologie", icon: "🧬" },
  { id: "french", name: "Français", icon: "📚" },
  { id: "english", name: "Anglais", icon: "🗣️" },
  { id: "history", name: "Histoire", icon: "🏛️" },
  { id: "geography", name: "Géographie", icon: "🗺️" }
]

const popularTags = [
  "Analyse", "Algèbre", "Géométrie", "Probabilités", "Statistiques",
  "Mécanique", "Thermodynamique", "Électricité", "Optique", "Ondes",
  "Organique", "Inorganique", "Réactions", "Solutions", "Atomique"
]

export function CourseFormSimple({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: CourseFormSimpleProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    subjectId: initialData?.subjectId || "",
    difficultyLevel: initialData?.difficultyLevel || 1,
    estimatedDuration: initialData?.estimatedDuration || 60,
    isPublished: initialData?.isPublished || false,
    tags: initialData?.tags || []
  })

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [newTag, setNewTag] = useState("")
  const [previewMode, setPreviewMode] = useState(false)

  const updateField = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData, uploadedFile || undefined)
  }

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      updateField("tags", [...formData.tags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateField("tags", formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleAddNewTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim())
      setNewTag("")
    }
  }

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "Très facile"
      case 2: return "Facile"
      case 3: return "Moyen"
      case 4: return "Difficile"
      case 5: return "Très difficile"
      default: return "Non défini"
    }
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
      case 2: return "text-success"
      case 3: return "text-warning"
      case 4:
      case 5: return "text-destructive"
      default: return "text-muted-foreground"
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Prévisualisation du cours</h2>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Retour à l'édition
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{subjects.find(s => s.id === formData.subjectId)?.icon}</span>
              <div>
                <CardTitle className="text-xl">{formData.title}</CardTitle>
                <p className="text-muted-foreground">{formData.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {formData.estimatedDuration} min
              </Badge>
              <Badge className={getDifficultyColor(formData.difficultyLevel)}>
                <Target className="h-3 w-3 mr-1" />
                {getDifficultyLabel(formData.difficultyLevel)}
              </Badge>
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br/>') }} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {initialData ? "Modifier le cours" : "Créer un nouveau cours"}
        </h2>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setPreviewMode(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre du cours</Label>
            <Input
              id="title"
              placeholder="Ex: Introduction à l'analyse mathématique"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Matière</Label>
            <Select 
              value={formData.subjectId} 
              onValueChange={(value) => updateField("subjectId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <span>{subject.icon}</span>
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            placeholder="Décrivez brièvement le contenu de ce cours..."
            rows={3}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Niveau de difficulté</Label>
            <Select 
              value={formData.difficultyLevel.toString()} 
              onValueChange={(value) => updateField("difficultyLevel", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    <span className={getDifficultyColor(level)}>
                      {getDifficultyLabel(level)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Durée estimée (minutes)</Label>
            <Input 
              id="duration"
              type="number"
              min="5"
              max="240"
              placeholder="60"
              value={formData.estimatedDuration}
              onChange={(e) => updateField("estimatedDuration", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNewTag())}
            />
            <Button type="button" onClick={handleAddNewTag} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-sm text-muted-foreground mr-2">Suggestions:</span>
            {popularTags.slice(0, 8).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="text-xs text-primary hover:underline"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Contenu du cours</Label>
          <Textarea 
            id="content"
            placeholder="Rédigez le contenu de votre cours ici..."
            rows={12}
            value={formData.content}
            onChange={(e) => updateField("content", e.target.value)}
            required
          />
          <p className="text-sm text-muted-foreground">
            Vous pouvez utiliser du texte enrichi et des retours à la ligne
          </p>
        </div>

        {/* PDF Upload */}
        <div className="space-y-3">
          <Label>Document PDF (optionnel)</Label>
          <FileUpload
            accept=".pdf"
            maxSize={10}
            maxFiles={1}
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* Publish Switch */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Publier le cours</Label>
            <p className="text-sm text-muted-foreground">
              Les cours publiés seront visibles par tous les étudiants
            </p>
          </div>
          <Switch
            checked={formData.isPublished}
            onCheckedChange={(checked) => updateField("isPublished", checked)}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="submit"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {initialData ? "Mettre à jour" : "Créer le cours"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
