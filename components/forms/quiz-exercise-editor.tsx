'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save, Eye, Plus, Trash2, GripVertical, Brain, FileText, X } from 'lucide-react'
import type { Value } from 'platejs'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { AdminPlateEditor } from '@/components/editor/admin-plate-editor'
import { MultiSelect, Option } from '@/components/ui/multi-select'
import { createClient } from '@/lib/supabase/client'
import { QuizExercise, Subject, Series, Tag, Country, Question, AnswerOption, Course } from '@/types/database'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface QuizExerciseEditorProps {
  mode: 'create' | 'edit'
  contentType: 'quiz' | 'exercise'
  initialData?: any // QuizExercise with related data
}

interface FormData {
  title: string
  description: string
  content_type: 'quiz' | 'exercise'
  subject_id: string
  series_id: string
  course_id: string
  difficulty_level: number
  estimated_duration: number
  instructions: Value
  status: 'draft' | 'published' | 'archived'
  tag_ids: string[]
}

interface QuestionData {
  id?: string
  question_text: Value
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer'
  points: number
  explanation: Value
  order_index: number
  answer_options: {
    id?: string
    option_text: string
    is_correct: boolean
    order_index: number
  }[]
}

const questionTypeLabels = {
  'single_choice': 'Choix unique',
  'multiple_choice': 'Choix multiples', 
  'true_false': 'Vrai/Faux',
  'short_answer': 'Réponse courte'
}

export function QuizExerciseEditor({ mode, contentType, initialData }: QuizExerciseEditorProps) {
  const router = useRouter()

  // Default empty editor value
  const emptyEditorValue: Value = [{ type: 'p', children: [{ text: '' }] }]

  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    content_type: contentType,
    subject_id: initialData?.subject_id || '',
    series_id: initialData?.series_id || '',
    course_id: initialData?.course_id || '',
    difficulty_level: initialData?.difficulty_level || 1,
    estimated_duration: initialData?.estimated_duration || 30,
    instructions: initialData?.instructions_json || emptyEditorValue,
    status: initialData?.status || 'draft',
    tag_ids: initialData?.quiz_exercise_tags?.map((et: any) => et.tag_id) || [],
  })

  const [questions, setQuestions] = useState<QuestionData[]>(
    initialData?.questions?.map((q: any, index: number) => ({
      id: q.id,
      question_text: q.question_text_json || emptyEditorValue,
      question_type: q.question_type,
      points: q.points,
      explanation: q.explanation_json || emptyEditorValue,
      order_index: index,
      answer_options: q.answer_options?.map((opt: any, optIndex: number) => ({
        id: opt.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        order_index: optIndex
      })) || []
    })) || []
  )

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [series, setSeries] = useState<(Series & { countries: Country })[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeQuestion, setActiveQuestion] = useState<number>(0)
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
        { data: coursesData },
        { data: tagsData },
        userRes,
      ] = await Promise.all([
        supabase.from('subjects').select('*').order('name'),
        supabase.from('series').select(`
          *,
          countries(*)
        `).order('name'),
        // Include drafts too, so members can attach quizzes/exercises to courses before publishing.
        // RLS will still scope the visible set appropriately.
        supabase.from('courses').select('*').neq('status', 'archived').order('title'),
        supabase.from('tags').select('*').order('name'),
        supabase.auth.getUser(),
      ])

      setSubjects(subjectsData || [])
      setSeries(seriesData || [])
      setCourses(coursesData || [])
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
    if (formData.estimated_duration < 1) {
      newErrors.estimated_duration = 'La durée doit être positive'
    }
    if (questions.length === 0) {
      newErrors.questions = 'Au moins une question est requise'
    }

    // Helper to check if editor content is empty
    const isEditorEmpty = (value: Value): boolean => {
      if (!value || value.length === 0) return true
      // Check if it's just an empty paragraph
      if (value.length === 1) {
        const firstNode = value[0] as any
        if (firstNode.type === 'p' && firstNode.children?.length === 1) {
          const textNode = firstNode.children[0]
          if (typeof textNode.text === 'string' && textNode.text.trim() === '') {
            return true
          }
        }
      }
      return false
    }

    // Validate questions
    questions.forEach((question, index) => {
      if (isEditorEmpty(question.question_text)) {
        newErrors[`question_${index}_text`] = 'Le texte de la question est requis'
      }
      
      if (contentType === 'quiz' && ['single_choice', 'multiple_choice', 'true_false'].includes(question.question_type)) {
        if (question.answer_options.length < 2) {
          newErrors[`question_${index}_options`] = 'Au moins 2 options sont requises'
        }
        
        const hasCorrectAnswer = question.answer_options.some(opt => opt.is_correct)
        if (!hasCorrectAnswer) {
          newErrors[`question_${index}_correct`] = 'Au moins une réponse correcte est requise'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateTagAssociations = async (quizExerciseId: string, tagIds: string[]) => {
    const supabase = createClient()

    // Delete existing associations
    await supabase.from('quiz_exercise_tags').delete().eq('quiz_exercise_id', quizExerciseId)

    // Insert new associations
    if (tagIds.length > 0) {
      const tagAssociations = tagIds.map(tag_id => ({
        quiz_exercise_id: quizExerciseId,
        tag_id
      }))
      const { error: tagError } = await supabase
        .from('quiz_exercise_tags')
        .insert(tagAssociations)
      if (tagError) throw tagError
    }
  }

  const saveQuestionsAndOptions = async (quizExerciseId: string) => {
    const supabase = createClient()

    // Delete existing questions and their options (cascade delete will handle options)
    await supabase.from('questions').delete().eq('quiz_exercise_id', quizExerciseId)

    // Insert new questions
    for (const question of questions) {
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          quiz_exercise_id: quizExerciseId,
          question_text_json: question.question_text,
          question_type: question.question_type,
          points: question.points,
          explanation_json: question.explanation,
          content_format: 'json',
          order_index: question.order_index
        })
        .select()
        .single()

      if (questionError) throw questionError

      // Insert answer options for quiz questions
      if (contentType === 'quiz' && question.answer_options.length > 0) {
        const optionsToInsert = question.answer_options.map(option => ({
          question_id: questionData.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          order_index: option.order_index
        }))

        const { error: optionsError } = await supabase
          .from('answer_options')
          .insert(optionsToInsert)

        if (optionsError) throw optionsError
      }
    }
  }

  const handleSubmit = async (status: 'draft' | 'published' = 'draft') => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const quizExerciseData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        content_type: formData.content_type,
        subject_id: formData.subject_id,
        series_id: formData.series_id || null,
        course_id: formData.course_id || null,
        difficulty_level: formData.difficulty_level,
        estimated_duration: formData.estimated_duration,
        instructions_json: formData.instructions,
        content_format: 'json' as const,
        status,
      }

      let quizExerciseId: string

      if (mode === 'edit' && initialData?.id) {
        const { data: result, error } = await supabase
          .from('quiz_exercises')
          .update(quizExerciseData)
          .eq('id', initialData.id)
          .select()
          .single()

        if (error) throw error
        quizExerciseId = initialData.id
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        
        const { data: result, error } = await supabase
          .from('quiz_exercises')
          .insert({ ...quizExerciseData, created_by: user?.id })
          .select()
          .single()

        if (error) throw error
        quizExerciseId = result.id
      }

      // Save questions and options
      await saveQuestionsAndOptions(quizExerciseId)

      // Update tag associations
      await updateTagAssociations(quizExerciseId, formData.tag_ids)

      const itemType = contentType === 'quiz' ? 'quiz' : 'exercice'
      toast.success(
        mode === 'edit' 
          ? `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${status === 'published' ? 'publié' : 'sauvegardé'} avec succès`
          : `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${status === 'published' ? 'créé et publié' : 'créé'} avec succès`
      )

      router.push('/dashboard/content/quiz')
    } catch (error) {
      console.error('Error saving quiz/exercise:', error)
      toast.error('Erreur lors de la sauvegarde')
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

  const addQuestion = () => {
    const newQuestion: QuestionData = {
      question_text: emptyEditorValue,
      question_type: contentType === 'quiz' ? 'single_choice' : 'short_answer',
      points: 1,
      explanation: emptyEditorValue,
      order_index: questions.length,
      answer_options: contentType === 'quiz' ? [
        { option_text: '', is_correct: false, order_index: 0 },
        { option_text: '', is_correct: false, order_index: 1 }
      ] : []
    }
    setQuestions([...questions, newQuestion])
    setActiveQuestion(questions.length)
  }

  const updateQuestion = (index: number, field: keyof QuestionData, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuestions(updatedQuestions)
  }

  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    setQuestions(updatedQuestions.map((q, i) => ({ ...q, order_index: i })))
    setActiveQuestion(Math.max(0, activeQuestion - 1))
  }

  const addAnswerOption = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]
    question.answer_options.push({
      option_text: '',
      is_correct: false,
      order_index: question.answer_options.length
    })
    setQuestions(updatedQuestions)
  }

  const updateAnswerOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions]
    const option = updatedQuestions[questionIndex].answer_options[optionIndex]
    
    if (field === 'is_correct' && value && updatedQuestions[questionIndex].question_type === 'single_choice') {
      // For single choice, uncheck other options
      updatedQuestions[questionIndex].answer_options.forEach((opt, i) => {
        opt.is_correct = i === optionIndex
      })
    } else {
      updatedQuestions[questionIndex].answer_options[optionIndex] = { ...option, [field]: value }
    }
    
    setQuestions(updatedQuestions)
  }

  const deleteAnswerOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answer_options = updatedQuestions[questionIndex].answer_options
      .filter((_, i) => i !== optionIndex)
      .map((opt, i) => ({ ...opt, order_index: i }))
    setQuestions(updatedQuestions)
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order indices
    const updatedItems = items.map((item, index) => ({ ...item, order_index: index }))
    setQuestions(updatedItems)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <span>Chargement...</span>
        </div>
      </div>
    )
  }

  const contentIcon = contentType === 'quiz' ? Brain : FileText
  const ContentIcon = contentIcon

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
          
          <div className="flex items-center gap-2">
            <ContentIcon className="h-5 w-5" />
            <span className="text-sm text-muted-foreground capitalize">
              {mode === 'edit' ? 'Modifier' : 'Créer'} {contentType === 'quiz' ? 'un quiz' : 'un exercice'}
            </span>
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
          
          {formData.status === 'published' && mode === 'edit' ? (
            <Button
              variant="secondary"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
            >
              Dépublier
            </Button>
          ) : (
            <Button
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting || !formData.title || !formData.subject_id || !formData.series_id}
            >
              <Eye className="h-4 w-4 mr-2" />
              Publier
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title')(e.target.value)}
                  placeholder={`Titre du ${contentType === 'quiz' ? 'quiz' : 'exercice'}`}
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
                  placeholder="Description du contenu (optionnel)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <AdminPlateEditor
                  value={formData.instructions}
                  onChange={handleChange('instructions')}
                  placeholder="Instructions pour les utilisateurs..."
                  galleryUserId={currentUserId ?? undefined}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Questions ({questions.length})</CardTitle>
                <Button onClick={addQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ContentIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune question</h3>
                  <p className="mb-4">Commencez par ajouter votre première question.</p>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une question
                  </Button>
                </div>
              ) : (
                <Tabs value={activeQuestion.toString()} onValueChange={(value) => setActiveQuestion(parseInt(value))}>
                  <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                    <TabsList className="h-auto p-1">
                      {questions.map((_, index) => (
                        <TabsTrigger
                          key={index}
                          value={index.toString()}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          Q{index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {questions.map((question, questionIndex) => (
                    <TabsContent key={questionIndex} value={questionIndex.toString()}>
                      <div className="space-y-4 border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Question {questionIndex + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteQuestion(questionIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label>Question *</Label>
                            <AdminPlateEditor
                              value={question.question_text}
                              onChange={(value) => updateQuestion(questionIndex, 'question_text', value)}
                              placeholder="Posez votre question..."
                              galleryUserId={currentUserId ?? undefined}
                            />
                            {errors[`question_${questionIndex}_text`] && (
                              <p className="text-sm text-red-500 mt-1">{errors[`question_${questionIndex}_text`]}</p>
                            )}
                          </div>

                          <div>
                            <Label>Type de question</Label>
                            <Select 
                              value={question.question_type} 
                              onValueChange={(value) => updateQuestion(questionIndex, 'question_type', value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(questionTypeLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Points</Label>
                            <Input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={question.points}
                              onChange={(e) => updateQuestion(questionIndex, 'points', parseFloat(e.target.value) || 1)}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>
                              {contentType === 'quiz' ? 'Explication (optionnel)' : 'Solution/Explication *'}
                            </Label>
                            <AdminPlateEditor
                              value={question.explanation}
                              onChange={(value) => updateQuestion(questionIndex, 'explanation', value)}
                              placeholder={contentType === 'quiz' ? 'Explication de la réponse...' : 'Solution détaillée...'}
                              galleryUserId={currentUserId ?? undefined}
                            />
                          </div>
                        </div>

                        {/* Answer Options for Quiz Questions */}
                        {contentType === 'quiz' && ['single_choice', 'multiple_choice', 'true_false'].includes(question.question_type) && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label>Réponses</Label>
                              {question.question_type !== 'true_false' && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addAnswerOption(questionIndex)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Ajouter
                                </Button>
                              )}
                            </div>
                            
                            {errors[`question_${questionIndex}_options`] && (
                              <p className="text-sm text-red-500">{errors[`question_${questionIndex}_options`]}</p>
                            )}
                            {errors[`question_${questionIndex}_correct`] && (
                              <p className="text-sm text-red-500">{errors[`question_${questionIndex}_correct`]}</p>
                            )}

                            {question.question_type === 'true_false' ? (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`q${questionIndex}_true`}
                                    checked={question.answer_options[0]?.is_correct || false}
                                    onCheckedChange={(checked) => {
                                      const options = [
                                        { option_text: 'Vrai', is_correct: !!checked, order_index: 0 },
                                        { option_text: 'Faux', is_correct: !checked, order_index: 1 }
                                      ]
                                      updateQuestion(questionIndex, 'answer_options', options)
                                    }}
                                  />
                                  <label htmlFor={`q${questionIndex}_true`}>Vrai</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`q${questionIndex}_false`}
                                    checked={question.answer_options[1]?.is_correct || false}
                                    onCheckedChange={(checked) => {
                                      const options = [
                                        { option_text: 'Vrai', is_correct: !checked, order_index: 0 },
                                        { option_text: 'Faux', is_correct: !!checked, order_index: 1 }
                                      ]
                                      updateQuestion(questionIndex, 'answer_options', options)
                                    }}
                                  />
                                  <label htmlFor={`q${questionIndex}_false`}>Faux</label>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {question.answer_options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <Checkbox
                                      checked={option.is_correct}
                                      onCheckedChange={(checked) => 
                                        updateAnswerOption(questionIndex, optionIndex, 'is_correct', checked)
                                      }
                                    />
                                    <Input
                                      value={option.option_text}
                                      onChange={(e) => 
                                        updateAnswerOption(questionIndex, optionIndex, 'option_text', e.target.value)
                                      }
                                      placeholder={`Option ${optionIndex + 1}`}
                                      className="flex-1"
                                    />
                                    {question.answer_options.length > 2 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteAnswerOption(questionIndex, optionIndex)}
                                        className="text-red-600"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
              
              {errors.questions && (
                <p className="text-sm text-red-500">{errors.questions}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

          {/* Subject, Series & Course */}
          <Card>
            <CardHeader>
              <CardTitle>Matière, série et cours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Matière *</Label>
                <Select 
                  value={formData.subject_id} 
                  onValueChange={handleChange('subject_id')}
                >
                  <SelectTrigger className={errors.subject_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Choisir une matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subject_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.subject_id}</p>
                )}
              </div>

              <div>
                <Label htmlFor="series">Série (optionnel)</Label>
                <Select
                  value={formData.series_id || 'none'}
                  onValueChange={(value) => handleChange('series_id')(value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une série" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune série (toutes les séries)</SelectItem>
                    {series.map((serie) => (
                      <SelectItem key={serie.id} value={serie.id}>
                        {serie.name} ({serie.countries?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="course">Cours (optionnel)</Label>
                <Select 
                  value={formData.course_id || 'none'} 
                  onValueChange={(value) => handleChange('course_id')(value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Associer à un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun cours</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Associez ce {contentType === 'quiz' ? 'quiz' : 'exercice'} à un cours spécifique (optionnel)
                </p>
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
