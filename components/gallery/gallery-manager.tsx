'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, PencilLine, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import katex from 'katex'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { GalleryUploadDialog } from '@/components/gallery/gallery-upload-dialog'

type GalleryAssetRow = Database['public']['Tables']['gallery_assets']['Row']

interface GalleryManagerProps {
  assets: GalleryAssetRow[]
  userRole: 'admin' | 'member'
  userId: string
}

export function GalleryManager({ assets: initialAssets, userRole, userId }: GalleryManagerProps) {
  const supabase = createClient()
  const router = useRouter()
  const [assets, setAssets] = useState<GalleryAssetRow[]>(initialAssets)
  const [filter, setFilter] = useState<'all' | 'image' | 'latex'>('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<GalleryAssetRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  const filteredAssets = useMemo(() => {
    if (filter === 'all') return assets
    return assets.filter((asset) => asset.type === filter)
  }, [assets, filter])

  const handleDelete = async (asset: GalleryAssetRow) => {
    setError('')
    if (!window.confirm(`Supprimer « ${asset.title} » ?`)) return
    setDeletingId(asset.id)
    try {
      if (asset.type === 'image' && asset.file_path) {
        const { error: storageError } = await supabase.storage
          .from('gallery-assets')
          .remove([asset.file_path])
        if (storageError) throw storageError
      }

      const { error: deleteError } = await supabase
        .from('gallery_assets')
        .delete()
        .eq('id', asset.id)

      if (deleteError) throw deleteError

      setAssets((prev) => prev.filter((item) => item.id !== asset.id))
      toast.success('Élément supprimé de la galerie')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError('Impossible de supprimer cet élément. Veuillez réessayer.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDialogOpenChange = (value: boolean) => {
    if (!value) {
      setEditingAsset(null)
    }
    setUploadOpen(value)
  }

  const handleAssetUpdated = (updatedAsset: GalleryAssetRow) => {
    setAssets((prev) => prev.map((item) => (item.id === updatedAsset.id ? updatedAsset : item)))
    toast.success('Contenu mis à jour')
    router.refresh()
  }

  const renderLatex = (latex?: string | null) => {
    if (!latex) return null
    try {
      const html = katex.renderToString(latex, { throwOnError: false, displayMode: true })
      return <div className="p-4" dangerouslySetInnerHTML={{ __html: html }} />
    } catch (err) {
      return <p className="text-xs text-muted-foreground">Prévisualisation indisponible</p>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Galerie médias & LaTeX</h1>
          <p className="text-muted-foreground">
            Centralisez les ressources visuelles et formules LaTeX pour vos cours et examens.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAsset(null)
            setUploadOpen(true)
          }}
        >
          Ajouter à la galerie
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous ({assets.length})</TabsTrigger>
          <TabsTrigger value="image">Images ({assets.filter((a) => a.type === 'image').length})</TabsTrigger>
          <TabsTrigger value="latex">Formules ({assets.filter((a) => a.type === 'latex').length})</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="space-y-4">
          {filteredAssets.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Aucun élément dans la galerie pour ce filtre. Ajoutez votre premier contenu !
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="flex flex-col">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="truncate text-base">{asset.title}</CardTitle>
                      <Badge variant={asset.type === 'image' ? 'outline' : 'secondary'} className="capitalize">
                        {asset.type === 'image' ? 'Image' : 'LaTeX'}
                      </Badge>
                    </div>
                    {asset.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{asset.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    {asset.type === 'image' && asset.file_url ? (
                      <div className="relative overflow-hidden rounded-md border bg-muted/20">
                        <Image
                          src={asset.file_url}
                          alt={asset.title}
                          width={600}
                          height={400}
                          className="h-48 w-full object-contain bg-white"
                        />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {renderLatex(asset.latex_content)}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true, locale: fr })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingAsset(asset)
                          setUploadOpen(true)
                        }}
                        disabled={deletingId === asset.id}
                      >
                        <PencilLine className="mr-1 h-4 w-4" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(asset)}
                        disabled={deletingId === asset.id}
                      >
                        <Trash className="mr-1 h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <GalleryUploadDialog
        open={uploadOpen}
        onOpenChange={handleDialogOpenChange}
        onUploaded={(asset) => {
          setAssets((prev) => [asset, ...prev])
          toast.success('Contenu ajouté à la galerie')
          router.refresh()
        }}
        onUpdated={handleAssetUpdated}
        userId={userId}
        asset={editingAsset}
      />
    </div>
  )
}
