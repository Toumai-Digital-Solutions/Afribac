'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save, Eye, Upload, Clock, AlertCircle, Loader2, FileText, BookOpen } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RichTextEditor from '@/components/editors/rich-text-editor'
import { MultiSelect, Option } from '@/components/ui/multi-select'
import { FileUpload } from './file-upload'
import { createClient } from '@/lib/supabase/client'
import { Exam, Subject, Series, Tag, Country } from '@/types/database'
import { logActivity } from '@/lib/activity'
import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete'

interface ExamEditorProps {
  mode: 'create' | 'edit'
  initialData?: any // Exam with related data
}

interface FormData {
  title: string
  description: string
  questions_content: string
  correction_content: string
  questions_pdf_url: string
  questions_pdf_filename: string
  correction_pdf_url: string
  correction_pdf_filename: string
  exam_type: 'baccalaureat' | 'school_exam' | 'mock_exam' | 'practice_test' | 'other'
  exam_year: number | null
  exam_session: string
  duration_minutes: number
  total_points: number | null
  subject_id: string
  series_id: string
  status: 'draft' | 'published' | 'archived'
  difficulty_level: number
  tag_ids: string[]
}

const examTypeLabels = {
  'baccalaureat': 'Baccalauréat',
  'school_exam': 'Examen scolaire',
  'mock_exam': 'Examen blanc',
  'practice_test': 'Test d\'entraînement',
  'other': 'Autre'
}

export function ExamEditor({ mode, initialData }: ExamEditorProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    questions_content: initialData?.questions_content || '',
    correction_content: initialData?.correction_content || '',
    questions_pdf_url: initialData?.questions_pdf_url || '',
    questions_pdf_filename: initialData?.questions_pdf_filename || '',
    correction_pdf_url: initialData?.correction_pdf_url || '',
    correction_pdf_filename: initialData?.correction_pdf_filename || '',
    exam_type: initialData?.exam_type || 'school_exam',
    exam_year: initialData?.exam_year || new Date().getFullYear(),
    exam_session: initialData?.exam_session || '',
    duration_minutes: initialData?.duration_minutes || 180,
    total_points: initialData?.total_points || null,
    subject_id: initialData?.subject_id || '',
    series_id: initialData?.series_id || '',
    status: initialData?.status || 'draft',
    difficulty_level: initialData?.difficulty_level || 3,
    tag_ids: initialData?.exam_tags?.map((et: any) => et.tag_id) || [],
  })

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [series, setSeries] = useState<(Series & { countries: Country })[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('questions')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

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
        userRes,
      ] = await Promise.all([
        supabase.from('subjects').select('*').order('name'),
        supabase.from('series').select(`
          *,
          countries(*)
        `).order('name'),
        supabase.from('tags').select('*').order('name'),
        supabase.auth.getUser(),
      ])

      setSubjects(subjectsData || [])
      setSeries(seriesData || [])
      setTags(tagsData || [])
      setCurrentUserId(userRes.data.user?.id ?? null)
    } catch (error) {
      console.error('Error loading form data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
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
    if (!formData.series_id) {
      newErrors.series_id = 'La série est requise'
    }
    if (formData.duration_minutes < 1) {
      newErrors.duration_minutes = 'La durée doit être positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateTagAssociations = async (examId: string, tagIds: string[]) => {
    const supabase = createClient()

    // Delete existing associations
    await supabase.from('exam_tags').delete().eq('exam_id', examId)

    // Insert new associations
    if (tagIds.length > 0) {
      const tagAssociations = tagIds.map(tag_id => ({
        exam_id: examId,
        tag_id
      }))
      const { error: tagError } = await supabase
        .from('exam_tags')
        .insert(tagAssociations)
      if (tagError) throw tagError
    }
  }

  const handleSubmit = async (status: 'draft' | 'published' = 'draft') => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const examData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        questions_content: formData.questions_content || null,
        correction_content: formData.correction_content || null,
        questions_pdf_url: formData.questions_pdf_url || null,
        questions_pdf_filename: formData.questions_pdf_filename || null,
        correction_pdf_url: formData.correction_pdf_url || null,
        correction_pdf_filename: formData.correction_pdf_filename || null,
        exam_type: formData.exam_type,
        exam_year: formData.exam_year,
        exam_session: formData.exam_session || null,
        duration_minutes: formData.duration_minutes,
        total_points: formData.total_points,
        subject_id: formData.subject_id,
        series_id: formData.series_id,
        status,
        difficulty_level: formData.difficulty_level,
      }

      let examId: string

      if (mode === 'edit' && initialData?.id) {
        const { data: result, error } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', initialData.id)
          .select()
          .single()

        if (error) throw error
        examId = initialData.id
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        
        const { data: result, error } = await supabase
          .from('exams')
          .insert({ ...examData, created_by: user?.id })
          .select()
          .single()

        if (error) throw error
        examId = result.id
        
        // For new exams, if files were uploaded with temporary folder, 
        // we would need to move them here. For now, files should be uploaded after exam creation.
      }

      // Update tag associations
      await updateTagAssociations(examId, formData.tag_ids)

      toast.success(
        mode === 'edit' 
          ? `Examen ${status === 'published' ? 'publié' : 'sauvegardé'} avec succès`
          : `Examen ${status === 'published' ? 'créé et publié' : 'créé'} avec succès`
      )

      await logActivity({
        action: mode === 'edit' ? 'exam:update' : 'exam:create',
        entityType: 'exam',
        entityId: examId,
        entityName: examData.title,
        metadata: {
          status,
          subject_id: formData.subject_id,
          series_id: formData.series_id,
          tag_ids: formData.tag_ids,
        },
      })

      router.push('/dashboard/content/exams')
    } catch (error) {
      console.error('Error saving exam:', error)
      toast.error('Erreur lors de la sauvegarde de l\'examen')
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
  const uploadExamFile = async (file: File, examId?: string) => {
    try {
      const supabase = createClient()
      
      // Get subject name for folder structure
      const subject = subjects.find(s => s.id === formData.subject_id)
      const subjectSlug = subject?.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown'
      
      // Use existing exam ID or generate a temporary one for new exams
      const examIdForFolder = examId || initialData?.id || `temp-${Date.now()}`
      
      // Create file path: /exams/subject-name-exam-id/filename
      const fileExtension = file.name.split('.').pop()
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `exams/${subjectSlug}-${examIdForFolder}/${fileName}`
      
      // Upload to course-materials bucket (reused for exams)
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

  const handleFileUpload = async (files: File[], type: 'questions_pdf' | 'correction_pdf') => {
    if (files.length === 0) return
    
    const file = files[0] // Take first file only
    
    try {
      // Upload the file first
      const { url, filename } = await uploadExamFile(file, initialData?.id)
      
      if (type === 'questions_pdf') {
        setFormData(prev => ({ 
          ...prev, 
          questions_pdf_url: url, 
          questions_pdf_filename: filename 
        }))
      } else {
        setFormData(prev => ({ 
          ...prev, 
          correction_pdf_url: url, 
          correction_pdf_filename: filename 
        }))
      }
      
      toast.success('Fichier uploadé avec succès')
      
    } catch (error) {
      toast.error('Erreur lors de l\'upload du fichier')
    }
  }

  // Prepare options for multi-select
  const tagOptions: Option[] = tags.map(tag => ({
    label: tag.name,
    value: tag.id,
    color: tag.color,
    group: tag.type === 'chapter' ? 'Chapitres' : 
           tag.type === 'difficulty' ? 'Difficulté' :
           tag.type === 'exam_type' ? 'Type d\'examen' :
           tag.type === 'school' ? 'Écoles' : 'Sujets'
  }))

  const subjectOptions: AutocompleteOption[] = subjects
    .filter((subject) => Boolean(subject?.id))
    .map((subject) => ({
      value: subject.id,
      label: subject.name,
      leading: (
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: subject.color }}
        />
      ),
    }))

  const seriesOptions: AutocompleteOption[] = series
    .filter((serie) => Boolean(serie?.id))
    .map((serie) => ({
      value: serie.id,
      label: serie.name,
      hint: serie.countries?.name,
    }))

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
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sauvegarde manuelle</span>
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
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting || !formData.title || !formData.subject_id || !formData.series_id}
          >
            <Eye className="h-4 w-4 mr-2" />
            Publier
          </Button>
        </div>
      </div>

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
                <Label htmlFor="title">Titre de l'examen *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title')(e.target.value)}
                  placeholder="ex: Baccalauréat S2 - Session Juin 2023"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description')(e.target.value)}
                  placeholder="Description de l'examen (optionnel)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu de l'examen</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="questions" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Questions
                  </TabsTrigger>
                  <TabsTrigger value="correction" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Correction
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="questions" className="mt-4">
                  <div className="space-y-4">
                    <RichTextEditor
                      content={formData.questions_content}
                      onChange={handleChange('questions_content')}
                      placeholder="Saisissez les questions de l'examen avec formatage riche, équations mathématiques..."
                      galleryUserId={currentUserId ?? undefined}
                    />
                    
                    <div>
                      <Label>Fichier PDF des questions (optionnel)</Label>
                      <span className='h-2'></span>
                      <FileUpload
                        accept=".pdf"
                        maxFiles={1}
                        maxSize={20}
                        onUpload={(files) => handleFileUpload(files, 'questions_pdf')}
                      />
                      {formData.questions_pdf_filename && (
                        <div className="mt-2">
                          <Badge variant="secondary">
                            {formData.questions_pdf_filename}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="correction" className="mt-4">
                  <div className="space-y-4">
                    <RichTextEditor
                      content={formData.correction_content}
                      onChange={handleChange('correction_content')}
                      placeholder="Saisissez la correction détaillée avec explications, calculs, solutions..."
                      galleryUserId={currentUserId ?? undefined}
                    />
                    
                    <div>
                      <Label>Fichier PDF de la correction (optionnel)</Label>
                      <span className='h-2'></span>
                      <FileUpload
                        accept=".pdf"
                        maxFiles={1}
                        maxSize={20}
                        onUpload={(files) => handleFileUpload(files, 'correction_pdf')}
                      />
                      {formData.correction_pdf_filename && (
                        <div className="mt-2">
                          <Badge variant="secondary">
                            {formData.correction_pdf_filename}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Exam Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de l'examen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="exam_type">Type d'examen</Label>
                <Select value={formData.exam_type} onValueChange={handleChange('exam_type')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(examTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="exam_year">Année</Label>
                  <Input
                    id="exam_year"
                    type="number"
                    min="2000"
                    max="2030"
                    value={formData.exam_year || ''}
                    onChange={(e) => handleChange('exam_year')(parseInt(e.target.value) || null)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Durée (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => handleChange('duration_minutes')(parseInt(e.target.value) || 0)}
                    className={errors.duration_minutes ? 'border-red-500' : ''}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="exam_session">Session</Label>
                <Input
                  id="exam_session"
                  value={formData.exam_session}
                  onChange={(e) => handleChange('exam_session')(e.target.value)}
                  placeholder="ex: Session normale, Juin 2023"
                />
              </div>

              <div>
                <Label htmlFor="total_points">Total des points</Label>
                <Input
                  id="total_points"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.total_points || ''}
                  onChange={(e) => handleChange('total_points')(parseFloat(e.target.value) || null)}
                  placeholder="ex: 20, 100"
                />
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
                    <SelectItem value="1">1 - Très facile</SelectItem>
                    <SelectItem value="2">2 - Facile</SelectItem>
                    <SelectItem value="3">3 - Moyen</SelectItem>
                    <SelectItem value="4">4 - Difficile</SelectItem>
                    <SelectItem value="5">5 - Très difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subject & Series */}
          <Card>
            <CardHeader>
              <CardTitle>Matière et série</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Matière *</Label>
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
                <Label htmlFor="series">Série *</Label>
                <Autocomplete
                  value={formData.series_id || null}
                  onChange={(nextValue) => handleChange('series_id')(nextValue)}
                  options={seriesOptions}
                  placeholder="Choisir une série"
                  searchPlaceholder="Rechercher une série..."
                  emptyText="Aucune série trouvée"
                  triggerClassName={errors.series_id ? 'border-red-500 focus-visible:ring-destructive/20' : undefined}
                />
                {errors.series_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.series_id}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
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
    </div>
  )
}
