'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, FileEdit } from 'lucide-react'
import Link from 'next/link'

export default function ContentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Content Error:', error)
  }, [error])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileEdit className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Gestion du contenu</h1>
      </div>
      
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur de chargement</AlertTitle>
        <AlertDescription>
          Impossible de charger la section de gestion du contenu. 
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error.message}
            </div>
          )}
        </AlertDescription>
      </Alert>

      <div className="flex gap-4">
        <Button onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            Retour au tableau de bord
          </Link>
        </Button>
      </div>
    </div>
  )
}
