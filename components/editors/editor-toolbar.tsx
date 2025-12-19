'use client'

import { type Editor } from '@tiptap/react'
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
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface EditorToolbarProps {
  editor: Editor | null
  mode: 'visual' | 'code'
  isFullscreen: boolean
  isExtractingPdf: boolean
  galleryUserId?: string
  onToggleFullscreen: () => void
  onUploadPdf: () => void
  onAddLink: () => void
  onAddImage: () => void
  onAddTable: () => void
  onOpenHtmlDialog: () => void
  onOpenMathDialog: () => void
  onOpenGalleryDialog: () => void
}

export function EditorToolbar({
  editor,
  mode,
  isFullscreen,
  isExtractingPdf,
  galleryUserId,
  onToggleFullscreen,
  onUploadPdf,
  onAddLink,
  onAddImage,
  onAddTable,
  onOpenHtmlDialog,
  onOpenMathDialog,
  onOpenGalleryDialog,
}: EditorToolbarProps) {
  return (
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

        {/* Shared Tools */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Quitter le mode étendu (Esc)" : "Mode étendu"}
          aria-label={isFullscreen ? "Quitter le mode étendu" : "Mode étendu"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={onUploadPdf} disabled={isExtractingPdf} title="Importer PDF">
          {isExtractingPdf ? <Wand2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
        </Button>

        {(mode === 'visual' || mode === 'code') && editor && (
          <>
            {mode === 'visual' && (
              <>
                <Button variant="ghost" size="sm" type="button" onClick={onAddLink}>
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={onAddImage}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={onAddTable}>
                  <TableIcon className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button variant="ghost" size="sm" type="button" onClick={onOpenHtmlDialog} title="Insérer du HTML" aria-label="Insérer du HTML">
              <FileCode className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={onOpenMathDialog}>
              <Pi className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onOpenGalleryDialog}
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
  )
}
