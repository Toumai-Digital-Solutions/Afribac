'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import katex from 'katex'
import Image from 'next/image'
import { Image as ImageIcon, PencilLine } from 'lucide-react'
import { ImageEditor } from '@/components/ui/image-editor'
type GalleryAssetRow = Database['public']['Tables']['gallery_assets']['Row']

interface GalleryUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onUploaded?: (asset: GalleryAssetRow) => void
  onUpdated?: (asset: GalleryAssetRow) => void
  asset?: GalleryAssetRow | null
}

export function GalleryUploadDialog({
  open,
  onOpenChange,
  onUploaded,
  onUpdated,
  userId,
  asset,
}: GalleryUploadDialogProps) {
  const supabase = createClient()
  const isEditMode = Boolean(asset)
  const [activeTab, setActiveTab] = useState<'image' | 'latex'>('image')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [latex, setLatex] = useState('\\frac{a}{b}')
  const [latexTitle, setLatexTitle] = useState('Formule LaTeX')
  const [latexMode, setLatexMode] = useState<'inline' | 'block'>('inline')
  const [uploading, setUploading] = useState(false)
  const [imageEditorOpen, setImageEditorOpen] = useState(false)
  const [imageEditorSource, setImageEditorSource] = useState<string | null>(null)
  const [editedImageBlob, setEditedImageBlob] = useState<Blob | null>(null)

  const sanitizeFileName = useCallback((value: string) => value.replace(/[^a-zA-Z0-9.\-_]/g, '-'), [])

  useEffect(() => {
    if (!imageFile) return
    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  useEffect(() => {
    if (!open) return

    if (asset) {
      setActiveTab(asset.type)
      setDescription(asset.description ?? '')
      setEditedImageBlob(null)
      setImageFile(null)

      if (asset.type === 'image') {
        setTitle(asset.title)
        setImagePreview(asset.file_url ?? null)
        setLatex('\\frac{a}{b}')
        setLatexTitle('Formule LaTeX')
        setLatexMode('inline')
      } else {
        setTitle('')
        setLatex(asset.latex_content ?? '')
        setLatexTitle(asset.title)
        setLatexMode('inline')
        setImagePreview(null)
      }
    } else {
      resetState()
    }
  }, [asset, open])

  const latexPreview = useMemo(() => {
    const trimmed = latex.trim()
    if (!trimmed) return ''
    try {
      return katex.renderToString(trimmed, {
        throwOnError: false,
        displayMode: latexMode === 'block',
      })
    } catch {
      return ''
    }
  }, [latex, latexMode])

  const resetState = () => {
    setTitle('')
    setDescription('')
    setImageFile(null)
    setImagePreview(null)
     setEditedImageBlob(null)
     setImageEditorSource(null)
     setImageEditorOpen(false)
    setLatex('\\frac{a}{b}')
    setLatexTitle('Formule LaTeX')
    setLatexMode('inline')
    setActiveTab('image')
  }

  const closeDialog = () => {
    onOpenChange(false)
    resetState()
  }

  const openImageEditor = () => {
    const source = imagePreview ?? asset?.file_url ?? null
    if (!source) {
      toast.error('Ajoutez ou sélectionnez une image à modifier.')
      return
    }
    setImageEditorSource(source)
    setImageEditorOpen(true)
  }

  const handleImageEdited = (blob: Blob) => {
    setEditedImageBlob(blob)
    const url = URL.createObjectURL(blob)
    setImagePreview(url)
    setImageEditorOpen(false)
  }

  const handleImageUpload = async () => {
    if (!title.trim()) {
      toast.error('Donnez un titre à cette image.')
      return
    }

    if (!isEditMode && !imageFile && !editedImageBlob) {
      toast.error('Sélectionnez une image à importer.')
      return
    }

    setUploading(true)
    try {
      if (isEditMode && asset?.type === 'image') {
        const currentAsset = asset as GalleryAssetRow
        const hasNewFile = Boolean(imageFile)
        const hasEditedBlob = Boolean(editedImageBlob)

        let targetPath = currentAsset.file_path ?? ''
        let filePayload: File | Blob | null = null
        let shouldDeletePrevious = false

        if (hasEditedBlob && editedImageBlob) {
          const baseName = imageFile?.name ?? currentAsset?.file_path?.split('/').pop() ?? `image-${Date.now()}.jpg`
          const sanitizedName = sanitizeFileName(baseName)
          filePayload = new File([editedImageBlob], sanitizedName, {
            type: editedImageBlob.type || imageFile?.type || 'image/jpeg',
          })

          if (!currentAsset?.file_path || hasNewFile) {
            targetPath = `${userId}/${Date.now()}-${sanitizedName}`
            shouldDeletePrevious = Boolean(currentAsset?.file_path && targetPath !== currentAsset.file_path)
          }
        } else if (hasNewFile && imageFile) {
          const sanitizedName = sanitizeFileName(imageFile.name)
          filePayload = imageFile
          targetPath = `${userId}/${Date.now()}-${sanitizedName}`
          shouldDeletePrevious = Boolean(currentAsset.file_path && targetPath !== currentAsset.file_path)
        }

        let nextFileUrl = currentAsset.file_url ?? null

        if (filePayload) {
          const { error: uploadError } = await supabase.storage
            .from('gallery-assets')
            .upload(targetPath, filePayload, {
              upsert: targetPath === currentAsset.file_path,
            })

          if (uploadError) throw uploadError

          const { data: publicUrlData } = supabase.storage
            .from('gallery-assets')
            .getPublicUrl(targetPath)

          nextFileUrl = publicUrlData.publicUrl

          if (shouldDeletePrevious && currentAsset.file_path && currentAsset.file_path !== targetPath) {
            const { error: removeError } = await supabase.storage
              .from('gallery-assets')
              .remove([currentAsset.file_path])

            if (removeError) {
              console.error('Failed to remove previous gallery file', removeError)
            }
          }
        }

        const { data, error } = await supabase
          .from('gallery_assets')
          .update({
            title: title.trim(),
            description: description.trim() || null,
            ...(filePayload
              ? {
                  file_path: targetPath,
                  file_url: nextFileUrl,
                }
              : {}),
          })
          .eq('id', currentAsset.id)
          .select()
          .single()

        if (error) throw error

        onUpdated?.(data)
        closeDialog()
        return
      }

      const fileName = imageFile?.name ?? `image-${Date.now()}.jpg`
      const sanitizedName = sanitizeFileName(fileName)
      const path = `${userId}/${Date.now()}-${sanitizedName}`
      const uploadPayload = editedImageBlob
        ? new File([editedImageBlob], sanitizedName, {
            type: editedImageBlob.type || imageFile?.type || 'image/jpeg',
          })
        : imageFile

      if (!uploadPayload) {
        toast.error('Sélectionnez une image à importer.')
        return
      }

      const { error: uploadError } = await supabase.storage
        .from('gallery-assets')
        .upload(path, uploadPayload, {
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('gallery-assets')
        .getPublicUrl(path)

      const fileUrl = publicUrlData.publicUrl

      const { data, error } = await supabase
        .from('gallery_assets')
        .insert({
          type: 'image',
          title: title.trim(),
          description: description.trim() || null,
          file_url: fileUrl,
          file_path: path,
          created_by: userId,
        })
        .select()
        .single()

      if (error) throw error

      onUploaded?.(data)
      closeDialog()
    } catch (error: any) {
      console.error(error)
      toast.error("Erreur lors de l'upload de l'image.")
    } finally {
      setUploading(false)
    }
  }

  const handleLatexSave = async () => {
    if (!latex.trim()) {
      toast.error('Saisissez une formule LaTeX.')
      return
    }

    setUploading(true)
    try {
      const { data, error } = await supabase
        .from('gallery_assets')
        .insert({
          type: 'latex',
          title: latexTitle.trim() || 'Formule sans titre',
          description: description.trim() || null,
          latex_content: latex.trim(),
          created_by: userId,
        })
        .select()
        .single()

      if (error) throw error

      onUploaded?.(data)
      closeDialog()
    } catch (error: any) {
      console.error(error)
      toast.error('Erreur lors de la sauvegarde de la formule.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetState()
      onOpenChange(value)
    }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ajouter à la galerie</DialogTitle>
          <DialogDescription>
            Importez une image pédagogique ou enregistrez une formule LaTeX pour la réutiliser dans vos contenus.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'image' | 'latex')} className="space-y-4">
          <TabsList>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="latex">Formule LaTeX</TabsTrigger>
          </TabsList>
          <TabsContent value="image" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gallery-image-title">Titre *</Label>
                  <Input
                    id="gallery-image-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Ex : Schéma du circuit RLC"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gallery-image-description">Description</Label>
                  <Textarea
                    id="gallery-image-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Notes utiles pour retrouver l'image"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gallery-image-input">Fichier image *</Label>
                  <Input
                    id="gallery-image-input"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      setImageFile(file)
                      setEditedImageBlob(null)
                      setImageEditorSource(null)
                      if (!file) {
                        setImagePreview(null)
                      }
                    }}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground">Formats recommandés : PNG, JPG ou SVG (max 5 MB).</p>
                </div>
              </div>
              <div className="flex items-center justify-center rounded-lg border bg-muted/40 p-4 min-h-[220px]">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Prévisualisation"
                    width={320}
                    height={200}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-sm text-muted-foreground space-y-2">
                    <ImageIcon className="mx-auto h-10 w-10" />
                    <p>Aucune image sélectionnée</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="latex" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gallery-latex-title">Titre</Label>
                  <Input
                    id="gallery-latex-title"
                    value={latexTitle}
                    onChange={(event) => setLatexTitle(event.target.value)}
                    placeholder="Ex : Formule de Taylor"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gallery-latex-description">Description</Label>
                  <Textarea
                    id="gallery-latex-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Notes ou contexte d'utilisation"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Mode d'affichage</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={latexMode === 'inline' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLatexMode('inline')}
                    >
                      Inline
                    </Button>
                    <Button
                      type="button"
                      variant={latexMode === 'block' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLatexMode('block')}
                    >
                      Bloc
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="gallery-latex-input">Formule LaTeX *</Label>
                  <Textarea
                    id="gallery-latex-input"
                    value={latex}
                    onChange={(event) => setLatex(event.target.value)}
                    className="min-h-[160px]"
                    placeholder="Ex : e^{i\\pi} + 1 = 0"
                  />
                </div>
                <div className="rounded-lg border bg-muted/40 p-4 min-h-[160px]">
                  {latexPreview ? (
                    <div dangerouslySetInnerHTML={{ __html: latexPreview }} />
                  ) : (
                    <p className="text-sm text-muted-foreground">La prévisualisation sera affichée ici.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter className="gap-2">
          <Button variant="ghost" type="button" onClick={closeDialog} disabled={uploading}>
            Annuler
          </Button>
          {activeTab === 'image' ? (
            <Button type="button" onClick={handleImageUpload} disabled={uploading}>
              {uploading ? 'Enregistrement…' : "Enregistrer l'image"}
            </Button>
          ) : (
            <Button type="button" onClick={handleLatexSave} disabled={uploading}>
              {uploading ? 'Enregistrement…' : 'Enregistrer la formule'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
