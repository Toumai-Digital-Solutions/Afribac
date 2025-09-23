'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mathematics from '@tiptap/extension-mathematics'
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Pi,
  Images,
  Wand2
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
      TableRow.extend({
        HTMLAttributes: {
          class: 'border border-gray-300',
        },
      }),
      TableHeader.extend({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-50 font-semibold p-2',
        },
      }),
      TableCell.extend({
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

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

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
    const content = mathMode === 'inline'
      ? `$${trimmed}$ `
      : `\n$$${trimmed}$$\n`
    editor.chain().focus().insertContent(content).run()
    setMathDialogOpen(false)
  }, [editor, mathLatex, mathMode])

  const handleInsertFromGallery = useCallback((asset: GalleryAssetRow) => {
    if (!editor) return

    if (asset.type === 'image' && asset.file_url) {
      editor
        .chain()
        .focus()
        .setImage({ src: asset.file_url, alt: asset.title || undefined })
        .run()
      return
    }

    if (asset.type === 'latex' && asset.latex_content) {
      const latex = asset.latex_content.trim()
      if (!latex) return
      editor.chain().focus().insertContent(`\n$$${latex}$$\n`).run()
    }
  }, [editor])

  if (!isMounted || !editor) {
    return (
      <div className="border rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {editable && (
        <div className="border-b p-2 bg-gray-50">
          <div className="flex flex-wrap items-center gap-1">
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
            <Button variant="ghost" size="sm" type="button" onClick={() => (editor.chain().focus() as any).setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => (editor.chain().focus() as any).setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}>
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => (editor.chain().focus() as any).setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}>
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => (editor.chain().focus() as any).setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}>
              <AlignJustify className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button variant="ghost" size="sm" type="button" onClick={addLink}>
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={addImage}>
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={addTable}>
              <TableIcon className="h-4 w-4" />
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
            <div className="flex-1" />
            <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {editable && (
        <div className="border-t p-2 bg-gray-50 text-xs text-gray-500 flex flex-wrap items-center justify-between gap-2">
          <span>Utilisez <code className="rounded bg-muted px-1">$...$</code> pour une formule inline ou <code className="rounded bg-muted px-1">$$...$$</code> pour un bloc.</span>
          <span className="text-gray-400 flex items-center gap-1"><Wand2 className="h-3 w-3" /> Astuce : la galerie (π) permet de réutiliser vos images et formules enregistrées.</span>
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
