'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import katex from 'katex'
import { GalleryUploadDialog } from '@/components/gallery/gallery-upload-dialog'
import { Loader2 } from 'lucide-react'

type GalleryAssetRow = Database['public']['Tables']['gallery_assets']['Row']

interface GalleryPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (asset: GalleryAssetRow) => void
  userId: string
}

export function GalleryPickerDialog({ open, onOpenChange, onSelect, userId }: GalleryPickerDialogProps) {
  const supabase = createClient()
  const [assets, setAssets] = useState<GalleryAssetRow[]>([])
  const [filter, setFilter] = useState<'image' | 'latex' | 'all'>('all')
  const [loading, setLoading] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase
      .from('gallery_assets')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setAssets(data)
        }
      })
      .then(() => setLoading(false))
  }, [open, supabase])

  const filteredAssets = useMemo(() => {
    if (filter === 'all') return assets
    return assets.filter((asset) => asset.type === filter)
  }, [assets, filter])

  const renderLatex = (latex?: string | null) => {
    if (!latex) return null
    try {
      const html = katex.renderToString(latex, { throwOnError: false, displayMode: true })
      return <div className="p-3" dangerouslySetInnerHTML={{ __html: html }} />
    } catch {
      return <p className="text-xs text-muted-foreground">Prévisualisation indisponible</p>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choisir depuis la galerie</DialogTitle>
          <DialogDescription>
            Sélectionnez un visuel ou une formule enregistrée pour l'insérer dans le contenu.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <Tabs value={filter} onValueChange={(val) => setFilter(val as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="latex">LaTeX</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={() => setUploadOpen(true)}>
            Ajouter depuis mon ordinateur
          </Button>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-2 text-sm">Chargement de la galerie…</span>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Aucun élément trouvé. Ajoutez un contenu pour commencer.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onSelect(asset)
                  onOpenChange(false)
                }}
                className="group text-left"
              >
                <div className="overflow-hidden rounded-lg border transition group-hover:border-primary">
                  <div className="flex items-center justify-between bg-muted/40 px-3 py-2">
                    <span className="font-medium text-sm truncate">{asset.title}</span>
                    <Badge variant={asset.type === 'image' ? 'outline' : 'secondary'} className="capitalize">
                      {asset.type === 'image' ? 'Image' : 'LaTeX'}
                    </Badge>
                  </div>
                  <div className="p-3 bg-white">
                    {asset.type === 'image' && asset.file_url ? (
                      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-md border bg-muted/20">
                        <Image
                          src={asset.file_url}
                          alt={asset.title}
                          width={400}
                          height={240}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      renderLatex(asset.latex_content)
                    )}
                  </div>
                  <div className="px-3 pb-3 text-xs text-muted-foreground">
                    Ajouté {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true, locale: fr })}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>

        <GalleryUploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUploaded={(asset) => {
            setAssets((prev) => [asset, ...prev])
            setFilter(asset.type === 'image' ? 'image' : 'latex')
          }}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  )
}

