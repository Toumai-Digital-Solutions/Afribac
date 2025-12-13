'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { PDFViewer } from '@/components/educational/pdf-viewer'
import { BookOpen, CheckCircle2, Clock, FileText, PlayCircle } from 'lucide-react'

type CourseDetail = {
  id: string
  title: string
  description: string | null
  content: string | null
  pdfUrl: string | null
  pdfFilename: string | null
  videoUrl: string | null
  estimatedDuration: number | null
  difficultyLevel: number | null
  subjectName: string | null
  subjectColor: string | null
  topicName: string | null
}

type InitialProgress = {
  completionPercentage: number
  timeSpentMinutes: number
  lastAccessed: string | null
  isCompleted: boolean
  bookmarks: number[]
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value))
}

function sanitizeHtmlForRender(raw: string) {
  const trimmed = (raw || '').trim()
  if (!trimmed) return ''
  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') return trimmed
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div>${trimmed}</div>`, 'text/html')
    doc.querySelectorAll('script, style, iframe, object, embed').forEach((el) => el.remove())
    doc.body.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase()
        if (name.startsWith('on')) el.removeAttribute(attr.name)
      })
    })
    return doc.body.innerHTML
  } catch {
    return trimmed
  }
}

function difficultyLabel(level: number | null) {
  switch (level) {
    case 1: return 'Débutant'
    case 2: return 'Facile'
    case 3: return 'Intermédiaire'
    case 4: return 'Avancé'
    case 5: return 'Expert'
    default: return '—'
  }
}

export function CourseDetailClient({
  course,
  initialProgress
}: {
  course: CourseDetail
  initialProgress: InitialProgress
}) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const startRef = useRef<number>(Date.now())
  const flushTimerRef = useRef<number | null>(null)
  const userIdRef = useRef<string | null>(null)

  const [completion, setCompletion] = useState<number>(clamp(initialProgress.completionPercentage || 0))
  const [timeSpentMinutes, setTimeSpentMinutes] = useState<number>(Math.max(0, initialProgress.timeSpentMinutes || 0))
  const [isCompleted, setIsCompleted] = useState<boolean>(Boolean(initialProgress.isCompleted))
  const [bookmarks, setBookmarks] = useState<number[]>(initialProgress.bookmarks || [])
  const [saving, setSaving] = useState(false)

  const safeContentHtml = useMemo(() => sanitizeHtmlForRender(course.content || ''), [course.content])

  const upsertProgress = useCallback(async (partial?: Partial<{
    completion_percentage: number
    time_spent: number
    is_completed: boolean
    bookmarks: number[]
  }>) => {
    const supabase = createClient()

    // Resolve user once (client-side)
    if (!userIdRef.current) {
      const { data } = await supabase.auth.getUser()
      userIdRef.current = data.user?.id ?? null
    }
    if (!userIdRef.current) return

    const payload = {
      user_id: userIdRef.current,
      course_id: course.id,
      completion_percentage: clamp(partial?.completion_percentage ?? completion),
      time_spent: Math.max(0, partial?.time_spent ?? timeSpentMinutes),
      is_completed: partial?.is_completed ?? isCompleted,
      bookmarks: partial?.bookmarks ?? bookmarks,
      last_accessed: new Date().toISOString()
    }

    await supabase
      .from('user_progress')
      .upsert(payload as any, { onConflict: 'user_id,course_id' })
  }, [course.id, completion, timeSpentMinutes, isCompleted, bookmarks])

  const flushTime = useCallback(async () => {
    if (saving) return

    const now = Date.now()
    const elapsedSeconds = Math.max(0, Math.floor((now - startRef.current) / 1000))
    startRef.current = now

    // Ignore extremely small durations
    if (elapsedSeconds < 10) return

    const addMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
    const nextTotal = timeSpentMinutes + addMinutes

    setSaving(true)
    try {
      setTimeSpentMinutes(nextTotal)
      await upsertProgress({ time_spent: nextTotal })
    } finally {
      setSaving(false)
    }
  }, [saving, timeSpentMinutes, upsertProgress])

  // Ensure progress row exists + keep last_accessed fresh
  useEffect(() => {
    upsertProgress().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id])

  // Auto-flush time every 20s and on leave/visibility change
  useEffect(() => {
    flushTimerRef.current = window.setInterval(() => {
      flushTime().catch(() => {})
    }, 20000)

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') {
        flushTime().catch(() => {})
      }
    }
    const onBeforeUnload = () => {
      // best-effort (no await)
      flushTime().catch(() => {})
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      if (flushTimerRef.current) window.clearInterval(flushTimerRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', onBeforeUnload)
      flushTime().catch(() => {})
    }
  }, [flushTime])

  // Track reading progress via scroll (content tab)
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        const maxScroll = el.scrollHeight - el.clientHeight
        if (maxScroll <= 0) return
        const pct = clamp(Math.round((el.scrollTop / maxScroll) * 100))
        // don’t force 100% unless user clicks “complete”
        const bounded = isCompleted ? 100 : Math.min(pct, 99)
        if (bounded !== completion) {
          setCompletion(bounded)
        }
      })
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
    }
  }, [completion, isCompleted])

  // Persist completion/bookmarks changes (debounced-ish)
  useEffect(() => {
    const t = window.setTimeout(() => {
      upsertProgress({ completion_percentage: completion, is_completed: isCompleted, bookmarks }).catch(() => {})
    }, 900)
    return () => window.clearTimeout(t)
  }, [completion, isCompleted, bookmarks, upsertProgress])

  const handleMarkComplete = async () => {
    setSaving(true)
    try {
      setIsCompleted(true)
      setCompletion(100)
      await upsertProgress({ is_completed: true, completion_percentage: 100 })
    } finally {
      setSaving(false)
    }
  }

  const handleBookmarkToggle = (page: number) => {
    setBookmarks((prev) => {
      const has = prev.includes(page)
      return has ? prev.filter((p) => p !== page) : [...prev, page].sort((a, b) => a - b)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{course.subjectName || 'Cours'}</Badge>
            {course.topicName ? <Badge variant="secondary">{course.topicName}</Badge> : null}
            {course.difficultyLevel ? <Badge variant="outline">{difficultyLabel(course.difficultyLevel)}</Badge> : null}
          </div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          {course.description ? (
            <p className="text-muted-foreground max-w-3xl">{course.description}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {course.estimatedDuration ?? 30} min
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {completion}% • {isCompleted ? 'Terminé' : 'En cours'}
            </span>
            <span>Temps passé : {timeSpentMinutes} min</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/student/courses">
            <Button variant="outline">Retour</Button>
          </Link>
          <Button onClick={handleMarkComplete} disabled={saving || isCompleted}>
            {isCompleted ? 'Terminé' : 'Marquer comme terminé'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lecture
          </CardTitle>
          <CardDescription>Votre progression se met à jour automatiquement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{completion}%</span>
            </div>
            <Progress value={completion} className="h-2" />
          </div>

          <Tabs defaultValue="content" className="space-y-4">
            <TabsList>
              <TabsTrigger value="content">Cours</TabsTrigger>
              <TabsTrigger value="pdf" disabled={!course.pdfUrl}>
                PDF
              </TabsTrigger>
              <TabsTrigger value="video" disabled={!course.videoUrl}>
                Vidéo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <div className="rounded-xl border bg-muted/10">
                <div
                  ref={contentRef}
                  className="max-h-[70vh] overflow-auto p-6"
                >
                  {safeContentHtml ? (
                    <div
                      className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: safeContentHtml }}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Ce cours n’a pas encore de contenu texte.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pdf">
              {course.pdfUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {course.pdfFilename || 'Document PDF'}
                    </div>
                    <Separator className="hidden sm:block" orientation="vertical" />
                  </div>
                  <PDFViewer
                    pdfUrl={course.pdfUrl}
                    title={course.title}
                    bookmarks={bookmarks}
                    onBookmark={handleBookmarkToggle}
                    onProgress={() => {}}
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Aucun PDF n’est associé à ce cours.
                </div>
              )}
            </TabsContent>

            <TabsContent value="video">
              {course.videoUrl ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <PlayCircle className="h-4 w-4" />
                    Vidéo associée
                  </div>
                  <div className="rounded-xl border bg-muted/10 p-4">
                    <a
                      href={course.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary underline"
                    >
                      Ouvrir la vidéo
                    </a>
                    <p className="text-xs text-muted-foreground mt-2">
                      (Intégration lecteur à venir — lien direct pour MVP)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Aucune vidéo n’est associée à ce cours.</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


