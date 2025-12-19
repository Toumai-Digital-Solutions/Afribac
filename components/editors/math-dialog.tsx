'use client'

import { useState, useMemo, useEffect } from 'react'
import katex from 'katex'
import { Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface MathDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (latex: string, mode: 'inline' | 'block') => void
}

export function MathDialog({ open, onOpenChange, onInsert }: MathDialogProps) {
  const [mathLatex, setMathLatex] = useState('\\frac{a}{b}')
  const [mathMode, setMathMode] = useState<'inline' | 'block'>('inline')

  const mathSnippets = [
    { label: 'Fraction', value: '\\frac{a}{b}' },
    { label: 'Racine', value: '\\sqrt{x}' },
    { label: 'Somme', value: '\\sum_{i=1}^{n} a_i' },
    { label: 'Intégrale', value: '\\int_{a}^{b} f(x) \\mathrm{d}x' },
    { label: 'Vecteur', value: '\\vec{v}' },
  ]

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setMathLatex((current) => current || '\\frac{a}{b}')
    }
  }, [open])

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

  const handleInsert = () => {
    onInsert(mathLatex, mathMode)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleInsert} disabled={!mathLatex.trim()}>
              Insérer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
