'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bomb, AlertTriangle } from 'lucide-react'

export function TestErrorBoundaries() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error('Test error boundary: This is a demonstration error!')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bomb className="h-5 w-5 text-red-500" />
          Test Error Boundaries
        </CardTitle>
        <CardDescription>
          Click the button to test the error boundary system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="destructive" 
          onClick={() => setShouldThrow(true)}
          className="w-full"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Trigger Test Error
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          This will demonstrate how errors are handled at this level
        </p>
      </CardContent>
    </Card>
  )
}
