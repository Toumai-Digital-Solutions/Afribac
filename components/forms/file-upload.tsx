"use client"

import { useCallback, useState } from "react"
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  accept?: string
  maxSize?: number // in MB
  maxFiles?: number
  onUpload?: (files: File[]) => Promise<void>
  onFileSelect?: (files: File[]) => void
  className?: string
  disabled?: boolean
}

interface UploadedFile {
  file: File
  id: string
  status: "uploading" | "success" | "error"
  progress: number
  error?: string
}

export function FileUpload({
  accept = ".pdf,.doc,.docx,.txt",
  maxSize = 10, // 10MB default
  maxFiles = 5,
  onUpload,
  onFileSelect,
  className,
  disabled = false
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const generateId = () => Math.random().toString(36).substring(2, 15)

  const validateFile = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `Le fichier est trop volumineux. Taille maximale: ${maxSize}MB`
    }

    // Check file type if specified
    if (accept) {
      const allowedExtensions = accept.split(",").map(ext => ext.trim().toLowerCase())
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
      
      if (!allowedExtensions.includes(fileExtension)) {
        return `Type de fichier non supporté. Types acceptés: ${accept}`
      }
    }

    return null
  }

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    if (disabled) return

    const newFiles = Array.from(fileList)
    
    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      alert(`Vous ne pouvez télécharger que ${maxFiles} fichiers maximum.`)
      return
    }

    const validatedFiles: UploadedFile[] = []

    for (const file of newFiles) {
      const error = validateFile(file)
      validatedFiles.push({
        file,
        id: generateId(),
        status: error ? "error" : "uploading",
        progress: 0,
        error: error || undefined
      })
    }

    setFiles(prev => [...prev, ...validatedFiles])
    
    // Call onFileSelect if provided
    const validFiles = validatedFiles.filter(f => !f.error).map(f => f.file)
    onFileSelect?.(validFiles)

    // Upload files if onUpload is provided
    if (onUpload) {
      for (const uploadFile of validatedFiles) {
        if (uploadFile.error) continue

        try {
          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            ))
          }, 200)

          await onUpload([uploadFile.file])

          clearInterval(progressInterval)
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: "success", progress: 100 }
              : f
          ))
        } catch (error) {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: "error", error: "Échec du téléchargement" }
              : f
          ))
        }
      }
    }
  }, [files.length, maxFiles, onUpload, onFileSelect, accept, maxSize, disabled])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "pdf": return "📄"
      case "doc":
      case "docx": return "📝"
      case "txt": return "📋"
      case "jpg":
      case "jpeg":
      case "png": return "🖼️"
      default: return "📎"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragOver ? "Déposer les fichiers ici" : "Glissez vos fichiers ici"}
            </p>
            <p className="text-sm text-muted-foreground">
              ou <span className="text-primary underline">cliquez pour parcourir</span>
            </p>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Types acceptés: {accept}</p>
            <p>Taille maximale: {maxSize}MB par fichier</p>
            <p>Maximum {maxFiles} fichiers</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Fichiers ({files.length}/{maxFiles})</h4>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                <div className="text-2xl">{getFileIcon(file.file.name)}</div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(file.file.size)}
                    </Badge>
                  </div>
                  
                  {file.status === "uploading" && (
                    <div className="space-y-1">
                      <Progress value={file.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground">
                        Téléchargement... {file.progress}%
                      </p>
                    </div>
                  )}
                  
                  {file.error && (
                    <p className="text-xs text-destructive">{file.error}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {file.status === "uploading" && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {file.status === "success" && (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                  {file.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
