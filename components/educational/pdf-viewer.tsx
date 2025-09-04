"use client"

import { useState } from "react"
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck
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
  totalPages = 24,
  onBookmark,
  bookmarks = [],
  onProgress
}: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(bookmarks.includes(currentPage))

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      setIsBookmarked(bookmarks.includes(newPage))
      onProgress?.(newPage, totalPages)
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

  const progressPercentage = (currentPage / totalPages) * 100

  return (
    <TooltipProvider>
      <div className={`flex flex-col bg-card rounded-xl border ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px]'}`}>
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
                  <Maximize2 className="h-4 w-4" />
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
        <div className="flex-1 overflow-auto bg-muted/10 p-4">
          <div 
            className="mx-auto bg-white shadow-lg"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              width: '595px', // A4 width
              minHeight: '842px', // A4 height
            }}
          >
            {/* Placeholder for actual PDF content */}
            <div className="w-full h-full border border-border rounded p-8 bg-white">
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted/60 rounded animate-pulse" />
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-4/6" />
                </div>
                <div className="h-32 bg-muted/30 rounded animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} className="h-4 bg-muted/40 rounded animate-pulse" />
                  ))}
                </div>
              </div>
              
              {/* Actual PDF would be embedded here */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Contenu PDF - Page {currentPage}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {title}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
