'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PDFViewer } from '@/components/educational/pdf-viewer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Save, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

type ExamForSimulation = {
  id: string
  title: string
  durationMinutes: number
  totalPoints: number | null
  subjectName: string | null
  questionsPdfUrl: string | null
  correctionPdfUrl: string | null
  questionsContent: string | null
  correctionContent: string | null
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ExamSimulationClient({ exam }: { exam: ExamForSimulation }) {
  const [isStarted, setIsStarted] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60)
  const [answerText, setAnswerText] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingAttempt, setLoadingAttempt] = useState(true)

  const startTsRef = useRef<number>(Date.now())
  const autosaveRef = useRef<number | null>(null)

  const answeredChars = useMemo(() => answerText.trim().length, [answerText])

  const loadOrCreateAttempt = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id
    if (!userId) return

    // Resume the latest non-completed attempt if present
    const { data: existing } = await supabase
      .from('exam_attempts')
      .select('id, started_at, submitted_at, time_spent_minutes, is_completed, answers')
      .eq('user_id', userId)
      .eq('exam_id', exam.id)
      .eq('is_completed', false)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing?.id) {
      setAttemptId(existing.id)
      const existingAnswers = (existing.answers as any) || {}
      setAnswerText(typeof existingAnswers?.responseText === 'string' ? existingAnswers.responseText : '')
      const spentSeconds = Math.max(0, Math.round((existing.time_spent_minutes ?? 0) * 60))
      setTimeLeft(Math.max(0, exam.durationMinutes * 60 - spentSeconds))
      return
    }

    // Create a new attempt (not started yet; we’ll start timer when user clicks Start)
    const { data: created, error } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: userId,
        exam_id: exam.id,
        time_spent_minutes: 0,
        is_completed: false,
        answers: { responseText: '' }
      })
      .select('id')
      .single()

    if (error) throw error
    setAttemptId(created.id)
  }, [exam.durationMinutes, exam.id])

  useEffect(() => {
    setLoadingAttempt(true)
    loadOrCreateAttempt()
      .catch((e) => {
        console.error(e)
        toast.error("Impossible de préparer la simulation")
      })
      .finally(() => setLoadingAttempt(false))
  }, [loadOrCreateAttempt])

  const persist = useCallback(async (opts?: { isCompleted?: boolean; submitted?: boolean }) => {
    if (!attemptId) return
    const supabase = createClient()

    const elapsedSeconds = Math.max(0, Math.round((Date.now() - startTsRef.current) / 1000))
    startTsRef.current = Date.now()

    const alreadySpentSeconds = Math.max(0, exam.durationMinutes * 60 - timeLeft)
    const nextSpentSeconds = isStarted ? alreadySpentSeconds + elapsedSeconds : alreadySpentSeconds
    const nextSpentMinutes = Math.floor(nextSpentSeconds / 60)

    setSaving(true)
    try {
      const patch: any = {
        time_spent_minutes: nextSpentMinutes,
        answers: {
          responseText: answerText
        }
      }

      if (opts?.submitted) {
        patch.submitted_at = new Date().toISOString()
      }
      if (typeof opts?.isCompleted === 'boolean') {
        patch.is_completed = opts.isCompleted
      }

      const { error } = await supabase
        .from('exam_attempts')
        .update(patch)
        .eq('id', attemptId)

      if (error) throw error
    } finally {
      setSaving(false)
    }
  }, [answerText, attemptId, exam.durationMinutes, isStarted, timeLeft])

  // Timer + autosave
  useEffect(() => {
    if (!isStarted || isSubmitted) return

    startTsRef.current = Date.now()

    const tick = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit at end
          setIsSubmitted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    autosaveRef.current = window.setInterval(() => {
      persist().catch(() => {})
    }, 15000)

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') {
        persist().catch(() => {})
      }
    }
    window.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(tick)
      if (autosaveRef.current) window.clearInterval(autosaveRef.current)
      window.removeEventListener('visibilitychange', onVisibility)
      persist().catch(() => {})
    }
  }, [isStarted, isSubmitted, persist])

  // When timer hits 0, finalize attempt
  useEffect(() => {
    if (!isSubmitted) return
    persist({ isCompleted: true, submitted: true })
      .then(() => toast.success('Copie soumise !'))
      .catch(() => toast.error('Erreur lors de la soumission'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted])

  const start = async () => {
    if (loadingAttempt) return
    if (!attemptId) {
      toast.error("Aucune tentative disponible")
      return
    }
    setIsStarted(true)
    startTsRef.current = Date.now()
    await persist().catch(() => {})
  }

  const manualSave = async () => {
    await persist()
    toast.success('Sauvegardé')
  }

  const submitNow = async () => {
    setIsSubmitted(true)
  }

  if (loadingAttempt) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Chargement de la simulation…
        </CardContent>
      </Card>
    )
  }

  if (!isStarted && !isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {exam.subjectName ? <Badge variant="secondary">{exam.subjectName}</Badge> : null}
            <Badge variant="outline">{exam.durationMinutes} min</Badge>
            {exam.totalPoints != null ? <Badge variant="outline">{exam.totalPoints} pts</Badge> : null}
          </div>
          <CardTitle className="text-2xl">{exam.title}</CardTitle>
          <CardDescription>
            Une tentative est créée pour vous. Cliquez sur “Commencer” pour lancer le chronomètre et activer la sauvegarde automatique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              La soumission finalise votre copie (vous pourrez toujours consulter la correction ensuite).
            </AlertDescription>
          </Alert>
          <Button onClick={start} className="w-full">
            Commencer
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isSubmitted) {
    const usedSeconds = Math.max(0, exam.durationMinutes * 60 - timeLeft)
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Simulation terminée</CardTitle>
          <CardDescription>Votre copie a été enregistrée.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/10 p-4 text-center">
              <div className="text-2xl font-semibold">{formatTime(usedSeconds)}</div>
              <div className="text-xs text-muted-foreground">Temps utilisé</div>
            </div>
            <div className="rounded-xl border bg-muted/10 p-4 text-center">
              <div className="text-2xl font-semibold">{answeredChars}</div>
              <div className="text-xs text-muted-foreground">Caractères écrits</div>
            </div>
            <div className="rounded-xl border bg-muted/10 p-4 text-center">
              <div className="text-2xl font-semibold">—</div>
              <div className="text-xs text-muted-foreground">Score (à venir)</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/student/exams/${exam.id}?tab=correction`} className="flex-1">
              <Button className="w-full">Voir la correction</Button>
            </Link>
            <Link href="/student/progress" className="flex-1">
              <Button variant="outline" className="w-full">Ma progression</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const usedSeconds = Math.max(0, exam.durationMinutes * 60 - timeLeft)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{exam.title}</CardTitle>
              <CardDescription>
                Écrivez votre copie. Sauvegarde auto toutes les 15s.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
                timeLeft < 600 ? 'bg-destructive/10 text-destructive' : 'bg-muted'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
              <Button variant="outline" onClick={manualSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
              <Button variant="destructive" onClick={submitNow} disabled={saving}>
                Soumettre
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="subject" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subject">Sujet</TabsTrigger>
          <TabsTrigger value="copy">Ma copie</TabsTrigger>
        </TabsList>

        <TabsContent value="subject" className="space-y-4">
          {exam.questionsPdfUrl ? (
            <PDFViewer pdfUrl={exam.questionsPdfUrl} title={`${exam.title} — Sujet`} />
          ) : exam.questionsContent ? (
            <Card>
              <CardContent className="p-6">
                <div
                  className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: exam.questionsContent }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Sujet indisponible pour le moment.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="copy" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="text-sm text-muted-foreground">
                Temps utilisé: {formatTime(usedSeconds)} • {answeredChars} caractères
              </div>
              <Textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Rédigez votre copie ici…"
                className="min-h-[55vh]"
              />
              <div className="text-xs text-muted-foreground">
                {saving ? 'Sauvegarde…' : 'À jour'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


