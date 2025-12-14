'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mathematics, { migrateMathStrings } from '@tiptap/extension-mathematics'
import Placeholder from '@tiptap/extension-placeholder'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import katex from 'katex'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Pi,
  Images,
  Wand2,
  FileCode,
  FileUp,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GalleryPickerDialog } from '@/components/gallery/gallery-picker-dialog'
import type { Database } from '@/lib/supabase'

// KaTeX styles are imported globally in app/globals.css

// Create lowlight instance with common languages
const lowlight = createLowlight()

// Register common languages for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'

lowlight.register('javascript', javascript)
lowlight.register('python', python)
lowlight.register('typescript', typescript)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('json', json)

type GalleryAssetRow = Database['public']['Tables']['gallery_assets']['Row']

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  editable?: boolean
  galleryUserId?: string
}

const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Commencez à écrire votre cours...",
  className,
  editable = true,
  galleryUserId,
}: RichTextEditorProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const onChangeRef = useRef(onChange)
  const [mathDialogOpen, setMathDialogOpen] = useState(false)
  const [mathLatex, setMathLatex] = useState('\\frac{a}{b}')
  const [mathMode, setMathMode] = useState<'inline' | 'block'>('inline')
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false)
  const [htmlDialogOpen, setHtmlDialogOpen] = useState(false)
  const [htmlSnippet, setHtmlSnippet] = useState('<p>Contenu HTML</p>')
  const [mode, setMode] = useState<'visual' | 'code'>('visual')
  const [codeContent, setCodeContent] = useState('')
  const [isExtractingPdf, setIsExtractingPdf] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Update ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Mathematics,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'table-auto border-collapse border border-gray-300',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-gray-300',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-50 font-semibold p-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
    ],
    content,
    editable,
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  }, [isMounted])

  // Sync code content when switching to code mode
  useEffect(() => {
    if (mode === 'code' && editor) {
      setCodeContent(editor.getHTML())
    }
  }, [mode, editor])

  // Sync editor content when switching back to visual mode
  const handleModeChange = (newMode: 'visual' | 'code') => {
    if (newMode === 'visual' && editor) {
      editor.commands.setContent(codeContent, { emitUpdate: true })
      // Force reprocessing of math strings (e.g. $...$) into Rendered Math nodes
      setTimeout(() => migrateMathStrings(editor), 0)
    }
    setMode(newMode)
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setCodeContent(newContent)
    onChangeRef.current(newContent)
  }



  const sanitizeHtmlSnippet = useCallback((raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return ''

    if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
      return trimmed
    }

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(`<div>${trimmed}</div>`, 'text/html')
      doc.querySelectorAll('script, style, iframe, object, embed').forEach((el) => el.remove())
      doc.body.querySelectorAll('*').forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
          if (attr.name.toLowerCase().startsWith('on')) {
            el.removeAttribute(attr.name)
          }
        })
      })
      return doc.body.innerHTML
    } catch (error) {
      console.error('Erreur lors de la sanitisation du HTML:', error)
      return trimmed
    }
  }, [])

  const htmlPreview = useMemo(() => sanitizeHtmlSnippet(htmlSnippet), [htmlSnippet, sanitizeHtmlSnippet])
  const canInsertHtml = useMemo(() => Boolean(htmlPreview.trim()), [htmlPreview])

  const formatHtmlSnippet = useCallback((raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return ''
    if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') return trimmed

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(`<div>${trimmed}</div>`, 'text/html')
      const root = doc.body.firstElementChild
      if (!root) return trimmed

      const formatNode = (node: Node, indent = 0): string => {
        const pad = '  '.repeat(indent)
        if (node.nodeType === Node.TEXT_NODE) {
          const text = (node.textContent || '').replace(/\s+/g, ' ').trim()
          return text ? pad + text : ''
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return ''
        const el = node as HTMLElement
        const tag = el.tagName.toLowerCase()
        const attrs = Array.from(el.attributes)
          .map((a) => `${a.name}="${a.value}"`)
          .join(' ')
        const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`
        const children = Array.from(el.childNodes)
          .map((child) => formatNode(child, indent + 1))
          .filter(Boolean)
        if (children.length === 0) return `${pad}${open}</${tag}>`
        return [`${pad}${open}`, ...children, `${pad}</${tag}>`].join('\n')
      }

      return Array.from(root.childNodes)
        .map((n) => formatNode(n, 0))
        .filter(Boolean)
        .join('\n')
    } catch {
      return trimmed
    }
  }, [])

  const handleInsertHtml = useCallback(() => {
    if (!editor) return
    const sanitized = sanitizeHtmlSnippet(htmlSnippet)
    if (!sanitized) return

    if (mode === 'visual') {
      editor.chain().focus().insertContent(sanitized).run()
      migrateMathStrings(editor)
    } else {
      // Append in code mode
      const newContent = codeContent + '\n' + sanitized + '\n'
      setCodeContent(newContent)
      onChangeRef.current(newContent)
    }

    setHtmlDialogOpen(false)
    setHtmlSnippet('<p>Contenu HTML</p>')
  }, [editor, htmlSnippet, sanitizeHtmlSnippet, mode, codeContent])

  useEffect(() => {
    if (!isFullscreen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isFullscreen])

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
    if (!file) return // editor might be null in code mode, so we remove that check

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
          setCodeContent((prev) => {
            const next = `${prev}\n${pageBlock}\n`
            onChangeRef.current(next)
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
  }, [editor, mode, extractTextFromPdfPage])

  useEffect(() => {
    // Only sync from props if we are in visual mode to avoid fighting with textarea
    if (mode === 'visual' && editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
    // In code mode, if content updates from outside (unlikely while editing), we could sync,
    // but usually unnecessary and causes cursor jumps.
  }, [content, editor, mode])

  const mathPreview = useMemo(() => {
    const trimmed = mathLatex.trim()
    if (!trimmed) return ''
    try {
      return katex.renderToString(trimmed, {
        throwOnError: false,
        displayMode: mathMode === 'block',
      })
    } catch {
      return ''
    }
  }, [mathLatex, mathMode])

  const mathSnippets = [
    { label: 'Fraction', value: '\\frac{a}{b}' },
    { label: 'Racine', value: '\\sqrt{x}' },
    { label: 'Somme', value: '\\sum_{i=1}^{n} a_i' },
    { label: 'Intégrale', value: '\\int_{a}^{b} f(x) \\mathrm{d}x' },
    { label: 'Vecteur', value: '\\vec{v}' },
  ]

  const addImage = useCallback(() => {
    const url = window.prompt('URL de l\'image:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL du lien:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  }, [editor])

  const handleInsertMath = useCallback(() => {
    if (!editor) return
    const trimmed = mathLatex.trim()
    if (!trimmed) return

    if (mode === 'visual') {
      const chain = editor.chain().focus()
      let inserted = false

      if (mathMode === 'inline') {
        inserted = chain.insertContent({ type: 'mathInline', attrs: { latex: trimmed } }).run()
      } else {
        inserted = chain.insertContent([{ type: 'mathBlock', attrs: { latex: trimmed } }, { type: 'paragraph' }]).run()
      }

      if (!inserted) {
        const content = mathMode === 'inline'
          ? `$${trimmed}$ `
          : `\n$$${trimmed}$$\n`

        editor.chain().focus().insertContent(content).run()
      }
      migrateMathStrings(editor)
    } else {
      // Code Mode
      const content = mathMode === 'inline'
        ? `$${trimmed}$ `
        : `\n$$${trimmed}$$\n`

      const newContent = codeContent + content
      setCodeContent(newContent)
      onChangeRef.current(newContent)
    }

    setMathDialogOpen(false)
  }, [editor, mathLatex, mathMode, mode, codeContent])

  const handleInsertFromGallery = useCallback((asset: GalleryAssetRow) => {
    if (!editor) return

    if (asset.type === 'image' && asset.file_url) {
      if (mode === 'visual') {
        editor
          .chain()
          .focus()
          .setImage({ src: asset.file_url, alt: asset.title || undefined })
          .run()
      } else {
        const alt = asset.title || ''
        const code = `<img src="${asset.file_url}" alt="${alt}" />`
        const newContent = codeContent + '\n' + code + '\n'
        setCodeContent(newContent)
        onChangeRef.current(newContent)
      }
      return
    }

    if (asset.type === 'latex' && asset.latex_content) {
      const latex = asset.latex_content.trim()
      if (!latex) return

      if (mode === 'visual') {
        const inserted = editor
          .chain()
          .focus()
          .insertContent([{ type: 'mathBlock', attrs: { latex } }, { type: 'paragraph' }])
          .run()

        if (!inserted) {
          editor.chain().focus().insertContent(`\n$$${latex}$$\n`).run()
        }
        migrateMathStrings(editor)
      } else {
        const code = `\n$$${latex}$$\n`
        const newContent = codeContent + code
        setCodeContent(newContent)
        onChangeRef.current(newContent)
      }
    }
  }, [editor, mode, codeContent])

  if (!isMounted) {
    return (
      <div className="border rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden flex flex-col bg-background',
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : '',
        className
      )}
    >
      {editable && (
        <div className="border-b p-2 bg-gray-50">
          <div className="flex flex-wrap items-center gap-1">
            {/* Visual Mode Tools */}
            {mode === 'visual' && editor && (
              <>
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-gray-200' : ''} disabled={!editor.can().chain().focus().toggleBold().run()}>
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-gray-200' : ''} disabled={!editor.can().chain().focus().toggleItalic().run()}>
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-gray-200' : ''} disabled={!editor.can().chain().focus().toggleStrike().run()}>
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'bg-gray-200' : ''} disabled={!editor.can().chain().focus().toggleCode().run()}>
                  <Code className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}>
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}>
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}>
                  <Heading3 className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}>
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}>
                  <Quote className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'bg-gray-200' : ''}>
                  <Code className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
              </>
            )}

            {/* Shared Tools (Available in both modes, adapt behavior) */}
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              title={isFullscreen ? "Quitter le mode étendu (Esc)" : "Mode étendu"}
              aria-label={isFullscreen ? "Quitter le mode étendu" : "Mode étendu"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => document.getElementById('pdf-upload')?.click()} disabled={isExtractingPdf} title="Importer PDF">
              {isExtractingPdf ? <Wand2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            </Button>
            <input
              type="file"
              id="pdf-upload"
              className="hidden"
              accept=".pdf"
              onChange={handlePdfUpload}
            />

            {(mode === 'visual' || mode === 'code') && editor && (
              <>
                {/* Links/Images/Tables - partially supported in Code mode if we just append? */}
                {mode === 'visual' && (
                  <>
                    <Button variant="ghost" size="sm" type="button" onClick={addLink}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" type="button" onClick={addImage}>
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" type="button" onClick={addTable}>
                      <TableIcon className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Math and HTML and Gallery - Useful in Code mode too */}
                <Button variant="ghost" size="sm" type="button" onClick={() => setHtmlDialogOpen(true)} title="Insérer du HTML" aria-label="Insérer du HTML">
                  <FileCode className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => setMathDialogOpen(true)}>
                  <Pi className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setGalleryDialogOpen(true)}
                  disabled={!galleryUserId}
                  className={!galleryUserId ? 'opacity-60' : ''}
                >
                  <Images className="h-4 w-4" />
                  <span className="ml-1 text-xs">Galerie</span>
                </Button>
              </>
            )}

            {mode === 'visual' && editor && (
              <>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>
                  <Redo className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div className={cn('flex-1 min-h-[400px] overflow-hidden relative', isFullscreen ? 'max-h-[calc(100vh-12rem)]' : 'max-h-[600px]')}>
        {mode === 'visual' ? (
          <div className="absolute inset-0 overflow-y-auto">
            <EditorContent editor={editor} className="h-full" />
          </div>
        ) : (
          <Textarea
            value={codeContent}
            onChange={handleCodeChange}
            className="absolute inset-0 w-full h-full font-mono text-xs p-4 resize-none border-0 focus-visible:ring-0 rounded-none bg-slate-900 text-slate-50 overflow-y-auto"
            placeholder="<!-- Code HTML -->"
            spellCheck={false}
          />
        )}
      </div>

      {editable && (
        <div className="border-t p-2 bg-gray-50 text-xs text-gray-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Toggle Mode Here */}
            <div className="flex bg-gray-200 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => handleModeChange('visual')}
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-md transition-all",
                  mode === 'visual' ? "bg-white shadow text-black" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Visuel
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('code')}
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-md transition-all",
                  mode === 'code' ? "bg-white shadow text-black" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Code
              </button>
            </div>

            <Separator orientation="vertical" className="h-4 mx-2" />

            <span>Utilisez <code className="rounded bg-muted px-1">$...$</code> pour inline ou <code className="rounded bg-muted px-1">$$...$$</code> pour bloc.</span>
          </div>
          <span className="text-gray-400 flex items-center gap-1"><Wand2 className="h-3 w-3" /> Astuce : la galerie (π) permet de réutiliser vos images.</span>
        </div>
      )}

      {editable && galleryUserId && (
        <GalleryPickerDialog
          open={galleryDialogOpen}
          onOpenChange={setGalleryDialogOpen}
          onSelect={handleInsertFromGallery}
          userId={galleryUserId}
        />
      )}

      {editable && (
        <Dialog
          open={htmlDialogOpen}
          onOpenChange={(open) => {
            setHtmlDialogOpen(open)
            if (!open) {
              setHtmlSnippet('<p>Contenu HTML</p>')
            }
          }}
        >
          <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Insérer un extrait HTML</DialogTitle>
              <DialogDescription>
                Collez un fragment HTML. Les balises sensibles (script, style, iframe…) et attributs d'évènements seront automatiquement supprimés.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={htmlSnippet}
              onChange={(event) => setHtmlSnippet(event.target.value)}
              className="min-h-[200px] resize-y"
              placeholder="<div>Votre contenu HTML</div>"
            />
            <div className="rounded-lg border bg-muted/40 p-3 min-h-[120px] max-h-[320px] overflow-auto">
              {htmlPreview ? (
                <div className="prose prose-sm sm:prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: htmlPreview }} />
              ) : (
                <span className="text-xs text-muted-foreground">La prévisualisation apparaît ici.</span>
              )}
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setHtmlSnippet((prev) => formatHtmlSnippet(prev))}
                disabled={!htmlSnippet.trim()}
              >
                Formatter
              </Button>
              <Button type="button" variant="ghost" onClick={() => setHtmlDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleInsertHtml} disabled={!canInsertHtml}>
                Insérer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editable && (
        <Dialog open={mathDialogOpen} onOpenChange={(open) => {
          setMathDialogOpen(open)
          if (open) {
            setMathLatex((current) => current || '\\frac{a}{b}')
          }
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Insérer une formule LaTeX</DialogTitle>
              <DialogDescription>
                Choisissez le mode d'affichage et composez votre formule. Vous pouvez utiliser les raccourcis ci-dessous pour démarrer plus vite.
              </DialogDescription>
            </DialogHeader>
            <RadioGroup value={mathMode} onValueChange={(value) => setMathMode(value as 'inline' | 'block')} className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 rounded-lg border p-2">
                <RadioGroupItem value="inline" id="math-mode-inline" />
                <Label htmlFor="math-mode-inline" className="flex-1 cursor-pointer">Inline (intégré au texte)</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-2">
                <RadioGroupItem value="block" id="math-mode-block" />
                <Label htmlFor="math-mode-block" className="flex-1 cursor-pointer">Bloc centré</Label>
              </div>
            </RadioGroup>
            <div className="flex flex-wrap gap-2">
              {mathSnippets.map((snippet) => (
                <Button key={snippet.label} type="button" variant="secondary" size="sm" onClick={() => setMathLatex(snippet.value)}>
                  {snippet.label}
                </Button>
              ))}
            </div>
            <Textarea
              value={mathLatex}
              onChange={(event) => setMathLatex(event.target.value)}
              className="min-h-[120px]"
              placeholder="Exemple : \frac{a}{b}"
            />
            <div className="rounded-lg border bg-muted/40 p-3 min-h-[80px]">
              {mathPreview ? (
                <div dangerouslySetInnerHTML={{ __html: mathPreview }} />
              ) : (
                <span className="text-xs text-muted-foreground">La prévisualisation apparaîtra ici.</span>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Button type="button" variant="outline" className="sm:mr-auto" disabled>
                <Images className="mr-2 h-4 w-4" /> Galerie LaTeX (bientôt)
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setMathDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={handleInsertMath} disabled={!mathLatex.trim()}>
                  Insérer
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default RichTextEditor
