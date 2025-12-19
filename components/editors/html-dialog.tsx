'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface HtmlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (html: string) => void
}

export function HtmlDialog({ open, onOpenChange, onInsert }: HtmlDialogProps) {
  const [htmlSnippet, setHtmlSnippet] = useState('<p>Contenu HTML</p>')

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

  const handleInsert = () => {
    const sanitized = sanitizeHtmlSnippet(htmlSnippet)
    if (sanitized) {
      onInsert(sanitized)
      onOpenChange(false)
      setHtmlSnippet('<p>Contenu HTML</p>')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
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
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleInsert} disabled={!canInsertHtml}>
            Insérer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
