"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PDFViewerProps {
  pdfUrl: string
  title: string
  totalPages?: number
  onBookmark?: (page: number) => void
  bookmarks?: number[]
  onProgress?: (page: number, totalPages: number) => void
}

export function PDFViewer({ 
  pdfUrl, 
  title,
  totalPages: totalPagesProp,
  onBookmark,
  bookmarks = [],
  onProgress
}: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0) // degrees
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(bookmarks.includes(currentPage))
  const [numPages, setNumPages] = useState<number>(totalPagesProp ?? 0)
  const [loadingPdf, setLoadingPdf] = useState(true)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pdfRef = useRef<any>(null)
  const renderTaskRef = useRef<any>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)

  const handlePageChange = (newPage: number) => {
    const maxPages = totalPagesProp ?? numPages ?? 0
    if (newPage >= 1 && newPage <= maxPages) {
      setCurrentPage(newPage)
      setIsBookmarked(bookmarks.includes(newPage))
      onProgress?.(newPage, maxPages)
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    onBookmark?.(currentPage)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${title}.pdf`
    link.click()
  }

  const totalPages = totalPagesProp ?? numPages ?? 1
  const progressPercentage = (currentPage / totalPages) * 100

  useEffect(() => {
    setIsBookmarked(bookmarks.includes(currentPage))
  }, [bookmarks, currentPage])

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.clientWidth)
    })
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoadingPdf(true)
      setError(null)
      try {
        const pdfjs = await import("pdfjs-dist")
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString()

        const loadingTask = pdfjs.getDocument({ url: pdfUrl })
        const pdf = await loadingTask.promise
        if (cancelled) return
        pdfRef.current = pdf
        setNumPages(pdf.numPages || 1)
        setCurrentPage(1)
      } catch (e: any) {
        if (cancelled) return
        setError("Impossible de charger le PDF. Vérifiez le lien et les permissions (CORS).")
      } finally {
        if (!cancelled) setLoadingPdf(false)
      }
    }

    if (pdfUrl) load()
    return () => {
      cancelled = true
      try {
        renderTaskRef.current?.cancel?.()
      } catch {}
      pdfRef.current = null
    }
  }, [pdfUrl])

  const rotationValue = useMemo(() => rotation, [rotation])

  useEffect(() => {
    const render = async () => {
      const pdf = pdfRef.current
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!pdf || !canvas || !container) return
      if (loadingPdf || error) return

      try {
        setRendering(true)

        // Cancel previous render if any
        try {
          renderTaskRef.current?.cancel?.()
        } catch {}

        const page = await pdf.getPage(currentPage)
        // Base viewport at scale 1 for sizing
        const baseViewport = page.getViewport({ scale: 1, rotation: rotationValue })

        const padding = 32 // viewer padding (p-4)
        const availableWidth = Math.max(containerWidth - padding, 200)
        const fitScale = availableWidth / baseViewport.width
        const finalScale = fitScale * (zoom / 100)

        const viewport = page.getViewport({ scale: finalScale, rotation: rotationValue })

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // HiDPI support
        const dpr = window.devicePixelRatio || 1
        canvas.width = Math.floor(viewport.width * dpr)
        canvas.height = Math.floor(viewport.height * dpr)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        const task = page.render({ canvasContext: ctx, viewport } as any)
        renderTaskRef.current = task
        await task.promise
      } catch (e: any) {
        // ignore cancellation
      } finally {
        setRendering(false)
      }
    }

    render()
  }, [currentPage, zoom, rotationValue, containerWidth, loadingPdf, error])

  useEffect(() => {
    if (!isFullscreen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isFullscreen])

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col bg-card rounded-xl border", isFullscreen ? "fixed inset-0 z-50" : "h-[600px]")}>
        {/* Header Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium truncate max-w-[200px]">{title}</h3>
              <p className="text-xs text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleBookmark}
                  className={isBookmarked ? "text-primary" : ""}
                >
                  {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isBookmarked ? "Supprimer le marque-page" : "Ajouter un marque-page"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Télécharger le PDF</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mode plein écran</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={currentPage}
                onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
                min={1}
                max={totalPages}
                className="w-16 h-8 text-center"
              />
              <span className="text-sm text-muted-foreground">/ {totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Badge variant="outline" className="min-w-16">
              {zoom}%
            </Badge>
            
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-muted/20">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground min-w-fit">Progression:</span>
            <Progress value={progressPercentage} className="flex-1 h-2" />
            <span className="text-xs font-medium min-w-fit">{Math.round(progressPercentage)}%</span>
          </div>
        </div>

        {/* PDF Display Area */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-muted/10 p-4">
          {loadingPdf ? (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Chargement du PDF...
              </div>
            </div>
          ) : error ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="max-w-md text-center space-y-2">
                <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-fit">
              <div className="relative rounded-lg border bg-white shadow-sm">
                <canvas ref={canvasRef} className="block rounded-lg" />
                {rendering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bookmarks Sidebar */}
        {bookmarks.length > 0 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-card border rounded-lg p-2 shadow-lg">
            <div className="text-xs font-medium mb-2 text-muted-foreground">Marque-pages</div>
            <div className="space-y-1">
              {bookmarks.map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-full text-xs justify-start"
                >
                  <Bookmark className="h-3 w-3 mr-1" />
                  Page {page}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        <div className="px-4 py-2 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            Raccourcis: ← → (navigation) • + - (zoom) • R (rotation) • F (plein écran)
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}
