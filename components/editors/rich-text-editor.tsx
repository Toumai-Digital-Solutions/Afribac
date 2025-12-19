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
import { useCallback, useEffect, useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GalleryPickerDialog } from '@/components/gallery/gallery-picker-dialog'
import type { Database } from '@/lib/supabase'

// Sub-components
import { EditorToolbar } from './editor-toolbar'
import { MathDialog } from './math-dialog'
import { HtmlDialog } from './html-dialog'
import { usePdfExtract } from './hooks/use-pdf-extract'

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
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false)
  const [htmlDialogOpen, setHtmlDialogOpen] = useState(false)
  const [mode, setMode] = useState<'visual' | 'code'>('visual')
  const [codeContent, setCodeContent] = useState('')
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

  const { isExtractingPdf, handlePdfUpload } = usePdfExtract({
    editor,
    mode,
    setCodeContent,
    onChange: (val) => onChangeRef.current(val)
  })

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

  useEffect(() => {
    if (!isFullscreen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isFullscreen])

  useEffect(() => {
    // Only sync from props if we are in visual mode to avoid fighting with textarea
    if (mode === 'visual' && editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor, mode])

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

  const handleInsertMath = useCallback((latex: string, mathMode: 'inline' | 'block') => {
    if (!editor) return
    const trimmed = latex.trim()
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
  }, [editor, mode, codeContent])

  const handleInsertHtml = useCallback((sanitized: string) => {
     if (!editor) return

    if (mode === 'visual') {
      editor.chain().focus().insertContent(sanitized).run()
      migrateMathStrings(editor)
    } else {
      // Append in code mode
      const newContent = codeContent + '\n' + sanitized + '\n'
      setCodeContent(newContent)
      onChangeRef.current(newContent)
    }
  }, [editor, mode, codeContent])

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
        <EditorToolbar
          editor={editor}
          mode={mode}
          isFullscreen={isFullscreen}
          isExtractingPdf={isExtractingPdf}
          galleryUserId={galleryUserId}
          onToggleFullscreen={() => setIsFullscreen((v) => !v)}
          onUploadPdf={() => document.getElementById('pdf-upload')?.click()}
          onAddLink={addLink}
          onAddImage={addImage}
          onAddTable={addTable}
          onOpenHtmlDialog={() => setHtmlDialogOpen(true)}
          onOpenMathDialog={() => setMathDialogOpen(true)}
          onOpenGalleryDialog={() => setGalleryDialogOpen(true)}
        />
      )}
      
       {/* Hidden file input for PDF upload, controlled by toolbar */}
       <input
        type="file"
        id="pdf-upload"
        className="hidden"
        accept=".pdf"
        onChange={handlePdfUpload}
      />

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
        <HtmlDialog
          open={htmlDialogOpen}
          onOpenChange={setHtmlDialogOpen}
          onInsert={handleInsertHtml}
        />
      )}

      {editable && (
        <MathDialog
          open={mathDialogOpen}
          onOpenChange={setMathDialogOpen}
          onInsert={handleInsertMath}
        />
      )}
    </div>
  )
}

export default RichTextEditor
