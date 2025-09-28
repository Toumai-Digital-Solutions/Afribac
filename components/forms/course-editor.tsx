'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save, Eye, Upload, Clock, CheckCircle, AlertCircle, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RichTextEditor from '@/components/editors/rich-text-editor'
import { MultiSelect, Option } from '@/components/ui/multi-select'
import { FileUpload } from './file-upload'
import { createClient } from '@/lib/supabase/client'
import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete'
import { logActivity } from '@/lib/activity'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
// import { useAutoSave } from '@/hooks/use-auto-save' // Disabled temporarily
import { Course, Subject, Series, Tag, Country, Topic } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const slugifyTopicName = (value: string) => {
  const base = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

  if (base.length === 0) {
    return `topic-${Date.now()}`
  }

  return base.slice(0, 60)
}

interface CourseEditorProps {
  mode: 'create' | 'edit'
  initialData?: any // Course with related data
}

interface FormData {
  title: string
  description: string
  content: string
  subject_id: string
  topic_id: string
  difficulty_level: number
  estimated_duration: number
  status: 'draft' | 'publish' | 'archived'
  pdf_url?: string
  pdf_filename?: string
  video_url?: string
  series_ids: string[]
  tag_ids: string[]
}

export function CourseEditor({ mode, initialData }: CourseEditorProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
    subject_id: initialData?.subject_id || '',
    topic_id: initialData?.topic_id || '',
    difficulty_level: initialData?.difficulty_level || 1,
    estimated_duration: initialData?.estimated_duration || 30,
    status: initialData?.status || 'draft',
    pdf_url: initialData?.pdf_url || '',
    pdf_filename: initialData?.pdf_filename || '',
    video_url: initialData?.video_url || '',
    series_ids: initialData?.course_series?.map((cs: any) => cs.series_id) || [],
    tag_ids: initialData?.course_tags?.map((ct: any) => ct.tag_id) || [],
  })

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [series, setSeries] = useState<(Series & { countries: Country })[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicDescription, setNewTopicDescription] = useState('')
  const [newTopicSeriesId, setNewTopicSeriesId] = useState<string>('none')
  const [creatingTopic, setCreatingTopic] = useState(false)
  const [topicDialogError, setTopicDialogError] = useState<string | null>(null)

  // Auto-save disabled temporarily
  // const { isSaving, lastSaved, forceSave, saveStatus } = useAutoSave({
  //   data: formData,
  //   onSave: saveAsDraft,
  //   delay: 5000,
  //   enabled: false,
  // })

  // Placeholder values for disabled auto-save
  const isSaving = false
  const lastSaved = null
  const saveStatus = 'idle' as const

  // Load form data
  useEffect(() => {
    loadFormData()
  }, [])

  const loadFormData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      const [
        { data: subjectsData },
        { data: seriesData },
        { data: tagsData },
        { data: topicsData },
        { data: countriesData },
        userRes,
      ] = await Promise.all([
        supabase.from('subjects').select('*').order('name'),
        supabase.from('series').select(`
          *,
          countries(*)
        `).order('name'),
        supabase.from('tags').select('*').order('name'),
        supabase
          .from('topics')
          .select('*')
          .order('position', { ascending: true })
          .order('name', { ascending: true }),
        supabase.from('countries').select('*').order('name'),
        supabase.auth.getUser(),
      ])

      setSubjects(subjectsData || [])
      setSeries(seriesData || [])
      setTags(tagsData || [])
      setTopics(topicsData || [])
      setCountries(countriesData || [])
      setCurrentUserId(userRes.data.user?.id ?? null)
    } catch (error) {
      console.error('Error loading form data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const updateAssociations = async (courseId: string, seriesIds: string[], tagIds: string[]) => {
    const supabase = createClient()

    // Update series associations
    await supabase.from('course_series').delete().eq('course_id', courseId)
    if (seriesIds.length > 0) {
      const seriesAssociations = seriesIds.map(series_id => ({
        course_id: courseId,
        series_id
      }))
      const { error: seriesError } = await supabase
        .from('course_series')
        .insert(seriesAssociations)
      if (seriesError) throw seriesError
    }

    // Update tag associations
    await supabase.from('course_tags').delete().eq('course_id', courseId)
    if (tagIds.length > 0) {
      const tagAssociations = tagIds.map(tag_id => ({
        course_id: courseId,
        tag_id
      }))
      const { error: tagError } = await supabase
        .from('course_tags')
        .insert(tagAssociations)
      if (tagError) throw tagError
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }
    if (!formData.subject_id) {
      newErrors.subject_id = 'La matière est requise'
    }
    if (formData.estimated_duration < 1) {
      newErrors.estimated_duration = 'La durée doit être positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    if (!formData.subject_id) {
      return
    }

    if (topics.length === 0) {
      return
    }

    const topicMatchesSubject = topics.some(
      topic => topic.id === formData.topic_id && topic.subject_id === formData.subject_id
    )

    if (!topicMatchesSubject) {
      setFormData(prev => ({ ...prev, topic_id: '' }))
    }
  }, [formData.subject_id, formData.topic_id, topics])

  const handleSubmit = async (status: 'draft' | 'publish' = 'draft') => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const courseData = {
        title: formData.title || 'Cours sans titre',
        description: formData.description || null,
        content: formData.content || null,
        subject_id: formData.subject_id,
        topic_id: formData.topic_id || null,
        difficulty_level: formData.difficulty_level,
        estimated_duration: formData.estimated_duration,
        status,
        pdf_url: formData.pdf_url || null,
        pdf_filename: formData.pdf_filename || null,
        video_url: formData.video_url || null,
      }

      let courseId: string

      if (mode === 'edit' && initialData?.id) {
        const { data: result, error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', initialData.id)
          .select()
          .single()

        if (error) throw error
        courseId = initialData.id
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        
        const { data: result, error } = await supabase
          .from('courses')
          .insert({ ...courseData, created_by: user?.id })
          .select()
          .single()

        if (error) throw error
        courseId = result.id
      }

      // Update associations
      await updateAssociations(courseId, formData.series_ids, formData.tag_ids)

      toast.success(
        mode === 'edit' 
          ? `Cours ${status === 'publish' ? 'publié' : 'sauvegardé'} avec succès`
          : `Cours ${status === 'publish' ? 'créé et publié' : 'créé'} avec succès`
      )

      await logActivity({
        action: mode === 'edit' ? 'course:update' : 'course:create',
        entityType: 'course',
        entityId: courseId,
        entityName: courseData.title,
        metadata: {
          status,
          subject_id: formData.subject_id,
          topic_id: formData.topic_id || null,
          series_ids: formData.series_ids,
          tag_ids: formData.tag_ids,
        },
      })

      router.push('/dashboard/content/courses')
    } catch (error) {
      console.error('Error saving course:', error)
      toast.error('Erreur lors de la sauvegarde du cours')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof FormData) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Upload files to Supabase storage
  const uploadCourseFile = async (file: File, folder: string) => {
    try {
      const supabase = createClient()
      
      // Get subject name for folder structure  
      const subject = subjects.find(s => s.id === formData.subject_id)
      const subjectSlug = subject?.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown'
      
      // Use existing course ID or generate a temporary one for new courses
      const courseIdForFolder = initialData?.id || `temp-${Date.now()}`
      
      // Create file path: /courses/subject-name-course-id/filename
      const fileExtension = file.name.split('.').pop()
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `courses/${subjectSlug}-${courseIdForFolder}/${fileName}`
      
      // Upload to course-materials bucket
      const { data, error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        })
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath)
      
      return { url: publicUrl, filename: file.name }
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return
    
    const file = files[0] // Take first file only
    
    try {
      const { url, filename } = await uploadCourseFile(file, 'pdfs')
      
      setFormData(prev => ({ 
        ...prev, 
        pdf_url: url, 
        pdf_filename: filename 
      }))
      
      toast.success('Fichier uploadé avec succès')
    } catch (error) {
      toast.error('Erreur lors de l\'upload du fichier')
    }
  }

  // Prepare options for multi-select
  const seriesOptions: Option[] = series
    .filter(serie => Boolean(serie.id))
    .map(serie => ({
      label: `${serie.name} (${serie.countries?.name})`,
      value: serie.id,
      group: serie.countries?.name
    }))

  const seriesAutocompleteOptions: AutocompleteOption[] = series
    .filter(serie => Boolean(serie.id))
    .map(serie => ({
      value: serie.id,
      label: serie.name,
      hint: serie.countries?.name,
    }))

  const subjectOptions: AutocompleteOption[] = subjects
    .filter(subject => Boolean(subject.id))
    .map(subject => ({
      value: subject.id,
      label: subject.name,
      leading: (
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: subject.color }}
        />
      ),
      searchKeywords: subject.description ? [subject.description] : undefined,
    }))

  const tagOptions: Option[] = tags
    .filter(tag => Boolean(tag.id))
    .map(tag => ({
      label: tag.name,
      value: tag.id,
      color: tag.color,
      group: tag.type === 'chapter' ? 'Chapitres' :
             tag.type === 'difficulty' ? 'Difficulté' :
             tag.type === 'exam_type' ? 'Type d\'examen' :
             tag.type === 'school' ? 'Écoles' : 'Sujets'
    }))

  const topicsForSubject = formData.subject_id
    ? topics
        .filter(topic => topic.subject_id === formData.subject_id)
        .filter(topic => Boolean(topic?.id && topic?.name))
        .sort((a, b) => (a.position - b.position) || a.name.localeCompare(b.name))
    : []

  const topicOptions: AutocompleteOption[] = [
    {
      value: 'none',
      label: 'Aucun thème',
      hint: 'Ne pas associer de thème',
    },
    ...topicsForSubject.map(topic => ({
      value: topic.id,
      label: topic.name,
      hint: topic.description || undefined,
    }))
  ]

  const selectedTopic = topics.find(topic => topic.id === formData.topic_id) || null

  const resetTopicDialog = useCallback(() => {
    setNewTopicName('')
    setNewTopicDescription('')
    setNewTopicSeriesId('none')
    setTopicDialogError(null)
    setCreatingTopic(false)
  }, [])

  const handleTopicDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetTopicDialog()
    }
    setIsTopicDialogOpen(open)
  }

  const openTopicDialog = () => {
    if (!formData.subject_id) {
      toast.error('Sélectionnez une matière avant de créer un thème')
      return
    }

    resetTopicDialog()
    setIsTopicDialogOpen(true)
  }

  const handleCreateTopic = async () => {
    if (!formData.subject_id) {
      setTopicDialogError('Choisissez une matière pour associer ce thème')
      return
    }

    const trimmedName = newTopicName.trim()

    if (!trimmedName) {
      setTopicDialogError('Le nom du thème est requis')
      return
    }

    setTopicDialogError(null)
    setCreatingTopic(true)

    try {
      const supabase = createClient()
      const subjectTopics = topics.filter(topic => topic.subject_id === formData.subject_id)
      const nextPosition = subjectTopics.length
        ? Math.max(...subjectTopics.map(topic => topic.position ?? 0)) + 1
        : 0

      const baseSlug = slugifyTopicName(trimmedName)
      let slug = baseSlug
      let counter = 1
      const existingSlugs = new Set(subjectTopics.map(topic => topic.slug))

      while (existingSlugs.has(slug)) {
        slug = `${baseSlug}-${counter++}`
      }

      const { data, error } = await supabase
        .from('topics')
        .insert({
          subject_id: formData.subject_id,
          series_id: newTopicSeriesId !== 'none' ? newTopicSeriesId : null,
          name: trimmedName,
          slug,
          description: newTopicDescription.trim() || null,
          position: nextPosition,
          created_by: currentUserId || null
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setTopics(prev => [...prev, data].sort((a, b) => (a.position - b.position) || a.name.localeCompare(b.name)))
        setFormData(prev => ({ ...prev, topic_id: data.id }))
        toast.success('Thème créé avec succès')
        setIsTopicDialogOpen(false)
        resetTopicDialog()

        await logActivity({
          action: 'topic:create',
          entityType: 'topic',
          entityId: data.id,
          entityName: data.name,
          metadata: {
            subject_id: data.subject_id,
            series_id: data.series_id,
          },
        })
      }
    } catch (error: any) {
      console.error('Error creating topic:', error)
      const message = error?.message || ''
      if (typeof message === 'string' && message.includes('topics_subject_id_slug_key')) {
        setTopicDialogError('Un thème portant ce nom existe déjà pour cette matière.')
      } else {
        setTopicDialogError(message || 'Erreur lors de la création du thème')
      }
    } finally {
      setCreatingTopic(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          {/* Auto-save disabled status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sauvegarde automatique désactivée</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          
          <Button
            onClick={() => handleSubmit('publish')}
            disabled={isSubmitting || !formData.title || !formData.subject_id}
          >
            <Eye className="h-4 w-4 mr-2" />
            Publier
          </Button>
        </div>
      </div>

      {/* Auto-save disabled */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Sauvegarde automatique désactivée. N'oubliez pas de sauvegarder vos modifications manuellement.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du cours *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title')(e.target.value)}
                  placeholder="Entrez le titre du cours"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description courte</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description')(e.target.value)}
                  placeholder="Description rapide du cours (optionnel)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu du cours</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.content}
                onChange={handleChange('content')}
                placeholder="Rédigez le contenu de votre cours avec formatage riche, équations mathématiques, images..."
                galleryUserId={currentUserId ?? undefined}
              />
            </CardContent>
          </Card>

          {/* Media Files */}
          <Card>
            <CardHeader>
              <CardTitle>Fichiers et médias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Fichier PDF (optionnel)</Label>
                <span className='h-2'></span>
                <FileUpload
                  accept=".pdf"
                  maxFiles={1}
                  maxSize={20}
                  onUpload={handleFileUpload}
                />
                {formData.pdf_filename && (
                  <div className="mt-2">
                    <Badge variant="secondary">
                      {formData.pdf_filename}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="video_url">URL vidéo (optionnel)</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => handleChange('video_url')(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Matière principale *</Label>
                  <Autocomplete
                    value={formData.subject_id || null}
                    onChange={(nextValue) => handleChange('subject_id')(nextValue)}
                    options={subjectOptions}
                    placeholder="Choisir une matière"
                    searchPlaceholder="Rechercher une matière..."
                    emptyText="Aucune matière trouvée"
                    triggerClassName={errors.subject_id ? 'border-red-500 focus-visible:ring-destructive/20' : undefined}
                  />
                  {errors.subject_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.subject_id}</p>
                  )}
                </div>

                <div>
                <Label htmlFor="topic">Thème</Label>
                  <Autocomplete
                    value={formData.topic_id ? formData.topic_id : 'none'}
                    onChange={(nextValue) => handleChange('topic_id')(nextValue === 'none' ? '' : nextValue)}
                    options={topicOptions}
                    placeholder={topicsForSubject.length === 0 ? 'Aucun thème disponible pour cette matière' : 'Sélectionnez un thème'}
                    searchPlaceholder="Rechercher un thème..."
                    emptyText={topicsForSubject.length === 0 ? 'Aucun thème disponible' : 'Aucun thème trouvé'}
                  />
                  {selectedTopic?.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedTopic.description}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={openTopicDialog}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un thème
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="difficulty">Niveau de difficulté</Label>
                <Select 
                  value={formData.difficulty_level.toString()} 
                  onValueChange={(value) => handleChange('difficulty_level')(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Débutant</SelectItem>
                    <SelectItem value="2">2 - Facile</SelectItem>
                    <SelectItem value="3">3 - Moyen</SelectItem>
                    <SelectItem value="4">4 - Difficile</SelectItem>
                    <SelectItem value="5">5 - Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Durée estimée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.estimated_duration}
                  onChange={(e) => handleChange('estimated_duration')(parseInt(e.target.value) || 0)}
                  className={errors.estimated_duration ? 'border-red-500' : ''}
                />
                {errors.estimated_duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.estimated_duration}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Series Association */}
          <Card>
            <CardHeader>
              <CardTitle>Séries associées</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiSelect
                options={seriesOptions}
                selected={formData.series_ids}
                onChange={handleChange('series_ids')}
                placeholder="Sélectionnez les séries"
                searchPlaceholder="Rechercher des séries..."
                emptyText="Aucune série trouvée"
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags et catégories</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiSelect
                options={tagOptions}
                selected={formData.tag_ids}
                onChange={handleChange('tag_ids')}
                placeholder="Sélectionnez des tags"
                searchPlaceholder="Rechercher des tags..."
                emptyText="Aucun tag trouvé"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isTopicDialogOpen} onOpenChange={handleTopicDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau thème</DialogTitle>
            <DialogDescription>
              Associez un nouveau thème à la matière sélectionnée pour organiser vos cours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-topic-name">Nom du thème *</Label>
              <Input
                id="new-topic-name"
                value={newTopicName}
                onChange={(event) => setNewTopicName(event.target.value)}
                placeholder="Exemple : Trigonométrie"
              />
            </div>

            <div>
              <Label htmlFor="new-topic-description">Description</Label>
              <Textarea
                id="new-topic-description"
                value={newTopicDescription}
                onChange={(event) => setNewTopicDescription(event.target.value)}
                placeholder="Informations supplémentaires (optionnel)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="new-topic-series">Série (optionnel)</Label>
              <Autocomplete
                value={newTopicSeriesId}
                onChange={(nextValue) => setNewTopicSeriesId(nextValue)}
                options={[{ value: 'none', label: 'Toutes les séries', hint: 'Disponible pour toutes les séries' }, ...seriesAutocompleteOptions]}
                placeholder="Toutes les séries"
                searchPlaceholder="Rechercher une série..."
                emptyText="Aucune série trouvée"
              />
            </div>

            {topicDialogError && (
              <p className="text-sm text-red-500">{topicDialogError}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleTopicDialogOpenChange(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleCreateTopic} disabled={creatingTopic}>
              {creatingTopic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le thème
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
