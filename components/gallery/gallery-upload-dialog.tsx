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
import { Image as ImageIcon, PencilLine, Undo2 } from 'lucide-react'
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
  const isEditingImage = isEditMode && asset?.type === 'image'
  const isEditingLatex = isEditMode && asset?.type === 'latex'
  const imageEditorAvailableSource = imagePreview ?? (asset?.type === 'image' ? asset.file_url ?? null : null)
  const canUseImageEditor = Boolean(imageEditorAvailableSource)

  const dialogTitle = isEditingImage
    ? "Modifier l'image"
    : isEditingLatex
    ? 'Modifier la formule LaTeX'
    : 'Ajouter à la galerie'

  const dialogDescription = isEditingImage
    ? "Mettez à jour le titre ou ajustez l'image grâce à l'éditeur intégré."
    : isEditingLatex
    ? 'Ajustez le contenu ou la mise en forme de la formule enregistrée.'
    : "Importez une image pédagogique ou enregistrez une formule LaTeX pour la réutiliser dans vos contenus."

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
      setImageEditorSource(null)
      setImageEditorOpen(false)

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
    resetState()
    onOpenChange(false)
  }

  const openImageEditor = () => {
    const source = imageEditorAvailableSource
    if (!source) {
      toast.error('Ajoutez ou sélectionnez une image à modifier.')
      return
    }
    setImageEditorSource(source)
    setImageEditorOpen(true)
  }

  const handleImageEdited = (blob: Blob) => {
    const nextPreviewUrl = URL.createObjectURL(blob)
    setEditedImageBlob(blob)
    setImagePreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev)
      }
      return nextPreviewUrl
    })
    setImageFile(null)
    setImageEditorOpen(false)
    setImageEditorSource(null)
  }

  const handleResetImage = () => {
    if (!asset || asset.type !== 'image') return
    setImageFile(null)
    setEditedImageBlob(null)
    setImageEditorSource(null)
    setImagePreview(asset.file_url ?? null)
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
          const sourceName = imageFile?.name ?? currentAsset?.file_path?.split('/').pop() ?? `image-${Date.now()}`
          const baseName = sanitizeFileName(sourceName.replace(/\.[^/.]+$/, '')) || 'image'
          const blobType = editedImageBlob.type || imageFile?.type || 'image/jpeg'
          const subtype = blobType.split('/')[1] ?? 'jpeg'
          const extension = subtype.includes('png')
            ? 'png'
            : subtype.includes('webp')
            ? 'webp'
            : subtype.includes('gif')
            ? 'gif'
            : 'jpg'
          const fileName = `${baseName}-edited.${extension}`
          const sanitizedName = sanitizeFileName(fileName)
          filePayload = new File([editedImageBlob], sanitizedName, {
            type: blobType,
          })
          targetPath = `${userId}/${Date.now()}-${sanitizedName}`
          shouldDeletePrevious = Boolean(currentAsset?.file_path && currentAsset.file_path !== targetPath)
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
      if (isEditMode && asset?.type === 'latex') {
        const { data, error } = await supabase
          .from('gallery_assets')
          .update({
            title: latexTitle.trim() || 'Formule sans titre',
            description: description.trim() || null,
            latex_content: latex.trim(),
          })
          .eq('id', asset.id)
          .select()
          .single()

        if (error) throw error

        onUpdated?.(data)
        closeDialog()
        return
      }

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
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) resetState()
          onOpenChange(value)
        }}
      >
        <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'image' | 'latex')} className="space-y-4">
          <TabsList>
            <TabsTrigger value="image" disabled={isEditMode && !isEditingImage}>
              Image
            </TabsTrigger>
            <TabsTrigger value="latex" disabled={isEditMode && !isEditingLatex}>
              Formule LaTeX
            </TabsTrigger>
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
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={openImageEditor}
                      disabled={!canUseImageEditor || uploading}
                    >
                      <PencilLine className="mr-2 h-4 w-4" />
                      Modifier / recadrer
                    </Button>
                    {isEditingImage && asset?.file_url ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleResetImage}
                        disabled={uploading}
                      >
                        <Undo2 className="mr-2 h-4 w-4" />
                        Réinitialiser l'image
                      </Button>
                    ) : null}
                  </div>
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
              {uploading ? (isEditMode ? 'Mise à jour…' : 'Enregistrement…') : isEditMode ? "Mettre à jour l'image" : "Enregistrer l'image"}
            </Button>
          ) : (
            <Button type="button" onClick={handleLatexSave} disabled={uploading}>
              {uploading ? (isEditMode ? 'Mise à jour…' : 'Enregistrement…') : isEditMode ? 'Mettre à jour la formule' : 'Enregistrer la formule'}
            </Button>
          )}
        </DialogFooter>
        </DialogContent>
      </Dialog>
      {imageEditorSource ? (
        <ImageEditor
          open={imageEditorOpen}
          onOpenChange={(value) => {
            setImageEditorOpen(value)
            if (!value) {
              setImageEditorSource(null)
            }
          }}
          imageSrc={imageEditorSource}
          onSave={handleImageEdited}
          onCancel={() => {
            setImageEditorOpen(false)
            setImageEditorSource(null)
          }}
        />
      ) : null}
    </>
  )
}
