'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingLink } from '@/components/ui/loading-link'
import { useLoading } from '@/components/providers/loading-provider'
import { useNavigationLoading } from '@/hooks/use-navigation-loading'
import { Download, Navigation, Link as LinkIcon, Loader2 } from 'lucide-react'

export function LoadingExamples() {
  const { startLoading, stopLoading, isLoading } = useLoading()
  const { push } = useNavigationLoading()

  const simulateAsyncOperation = async () => {
    startLoading()
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Operation completed')
    } finally {
      stopLoading()
    }
  }

  const navigateWithLoading = () => {
    push('/dashboard/content')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5" />
            Header Loading Bar Examples
          </CardTitle>
          <CardDescription>
            Different ways to trigger the header loading bar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Manual Loading Control */}
          <div className="space-y-2">
            <h3 className="font-medium">Manual Loading Control</h3>
            <Button 
              onClick={simulateAsyncOperation}
              disabled={isLoading}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isLoading ? 'Loading...' : 'Simulate Async Operation'}
            </Button>
          </div>

          {/* Programmatic Navigation */}
          <div className="space-y-2">
            <h3 className="font-medium">Programmatic Navigation</h3>
            <Button 
              onClick={navigateWithLoading}
              variant="outline"
              className="w-full"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Navigate to Content Section
            </Button>
          </div>

          {/* Loading Link Component */}
          <div className="space-y-2">
            <h3 className="font-medium">Loading Link Component</h3>
            <LoadingLink 
              href="/dashboard/analytics"
              className="block w-full"
            >
              <Button variant="secondary" className="w-full">
                <LinkIcon className="mr-2 h-4 w-4" />
                Go to Analytics (with Loading)
              </Button>
            </LoadingLink>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• The loading bar appears at the top of the page</p>
            <p>• It automatically stops when navigation completes</p>
            <p>• Manual operations need to call stopLoading()</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
