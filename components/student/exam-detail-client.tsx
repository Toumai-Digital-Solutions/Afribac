'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PDFViewer } from '@/components/educational/pdf-viewer'
import { FileText, Timer } from 'lucide-react'

type ExamDetail = {
  id: string
  title: string
  description: string | null
  subjectName: string | null
  seriesName: string | null
  countryName: string | null
  durationMinutes: number | null
  totalPoints: number | null
  examYear: number | null
  examSession: string | null
  questionsPdfUrl: string | null
  correctionPdfUrl: string | null
  questionsContent: string | null
  correctionContent: string | null
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

export function ExamDetailClient({
  exam,
  defaultTab
}: {
  exam: ExamDetail
  defaultTab: 'subject' | 'correction'
}) {
  const safeQuestionsHtml = useMemo(() => sanitizeHtmlForRender(exam.questionsContent || ''), [exam.questionsContent])
  const safeCorrectionHtml = useMemo(() => sanitizeHtmlForRender(exam.correctionContent || ''), [exam.correctionContent])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {exam.subjectName ? <Badge variant="secondary">{exam.subjectName}</Badge> : null}
            {exam.seriesName ? <Badge variant="outline">{exam.seriesName}</Badge> : null}
            {exam.countryName ? <Badge variant="outline">{exam.countryName}</Badge> : null}
            {exam.examYear ? <Badge variant="outline">Session {exam.examYear}</Badge> : null}
            {exam.examSession ? <Badge variant="outline">{exam.examSession}</Badge> : null}
          </div>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          {exam.description ? <p className="text-muted-foreground max-w-3xl">{exam.description}</p> : null}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Timer className="h-4 w-4" />
              {exam.durationMinutes ?? 180} min
            </span>
            <span>
              Total : {exam.totalPoints ?? 'Non précisé'} points
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/student/exams">
            <Button variant="outline">Retour</Button>
          </Link>
          <Link href={`/student/simulation/${exam.id}`}>
            <Button>Mode simulation</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sujet & correction
          </CardTitle>
          <CardDescription>Consultez le sujet et passez à la correction quand vous êtes prêt.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="subject">Sujet</TabsTrigger>
              <TabsTrigger value="correction">Correction</TabsTrigger>
            </TabsList>

            <TabsContent value="subject" className="space-y-4">
              {exam.questionsPdfUrl ? (
                <PDFViewer pdfUrl={exam.questionsPdfUrl} title={`${exam.title} — Sujet`} />
              ) : safeQuestionsHtml ? (
                <div className="rounded-xl border bg-muted/10 p-6">
                  <div
                    className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: safeQuestionsHtml }}
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Sujet indisponible pour le moment.</div>
              )}
            </TabsContent>

            <TabsContent value="correction" className="space-y-4">
              {exam.correctionPdfUrl ? (
                <PDFViewer pdfUrl={exam.correctionPdfUrl} title={`${exam.title} — Correction`} />
              ) : safeCorrectionHtml ? (
                <div className="rounded-xl border bg-muted/10 p-6">
                  <div
                    className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: safeCorrectionHtml }}
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Correction indisponible pour le moment.</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


