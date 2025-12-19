'use client'

import { useState, useCallback } from 'react'
import { type Editor } from '@tiptap/react'
import { migrateMathStrings } from '@tiptap/extension-mathematics'

interface UsePdfExtractProps {
  editor: Editor | null
  mode: 'visual' | 'code'
  setCodeContent: (value: string | ((prev: string) => string)) => void
  onChange: (value: string) => void
}

export function usePdfExtract({ editor, mode, setCodeContent, onChange }: UsePdfExtractProps) {
  const [isExtractingPdf, setIsExtractingPdf] = useState(false)

  const extractTextFromPdfPage = useCallback(async (page: any) => {
    const textContent = await page.getTextContent()
    const items = (textContent.items || []) as Array<{ str: string; transform?: number[] }>
    const lines: Array<{ y: number; parts: string[] }> = []
    const tolerance = 2.5

    for (const item of items) {
      const str = (item.str || '').trim()
      if (!str) continue
      const y = item.transform?.[5] ?? 0
      const existing = lines.find((l) => Math.abs(l.y - y) <= tolerance)
      if (existing) existing.parts.push(str)
      else lines.push({ y, parts: [str] })
    }

    lines.sort((a, b) => b.y - a.y)
    return lines.map((l) => l.parts.join(' ')).join('\n').trim()
  }, [])

  const handlePdfUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsExtractingPdf(true)
    try {
      const pdfJS = await import('pdfjs-dist')
      // Avoid remote worker (offline/prod-safe): use bundled worker.
      pdfJS.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString()

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfJS.getDocument({ data: arrayBuffer }).promise

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        // Prefer text extraction first (works for selectable-text PDFs)
        const extractedText = await extractTextFromPdfPage(page)
        const hasText = extractedText.length >= 40

        let extractedHtml = ''

        if (hasText) {
          const paragraphs = extractedText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
          extractedHtml = paragraphs.join('')
        } else {
          // Fallback: OCR/AI extraction for scanned PDFs (requires /api/extract-pdf configured)
          const viewport = page.getViewport({ scale: 2 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) continue

          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({ canvasContext: context, viewport, canvas } as any).promise
          const base64Image = canvas.toDataURL('image/png').split(',')[1]

          const response = await fetch('/api/extract-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: [base64Image] }),
          })

          if (!response.ok) throw new Error('Extraction failed')

          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let pageText = ''

          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              pageText += decoder.decode(value, { stream: true })
            }
          }

          extractedHtml = pageText.trim()
        }

        if (!extractedHtml) continue

        const pageHeader = `<h3>Page ${i}</h3>`
        const pageBlock = `${pageHeader}${extractedHtml}<hr />`

        if (mode === 'visual' && editor) {
          editor.chain().focus('end').insertContent(pageBlock).run()
          migrateMathStrings(editor)
        } else {
          setCodeContent((prev: string) => {
            const next = `${prev}\n${pageBlock}\n`
            onChange(next)
            return next
          })
        }
      }

    } catch (error) {
      console.error('PDF upload error:', error)
      alert("Erreur lors de l'extraction du PDF")
    } finally {
      setIsExtractingPdf(false)
      e.target.value = ''
    }
  }, [editor, mode, extractTextFromPdfPage, setCodeContent, onChange])

  return { isExtractingPdf, handlePdfUpload }
}
