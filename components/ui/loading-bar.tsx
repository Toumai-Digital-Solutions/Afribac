'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface LoadingBarProps {
  isLoading?: boolean
  className?: string
}

export function LoadingBar({ isLoading = false, className }: LoadingBarProps) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setVisible(true)
      setProgress(0)
      
      // Simulate loading progress
      const timer = setTimeout(() => setProgress(30), 50)
      const timer2 = setTimeout(() => setProgress(60), 200)
      const timer3 = setTimeout(() => setProgress(80), 500)
      
      return () => {
        clearTimeout(timer)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      // Complete the loading
      setProgress(100)
      const hideTimer = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 200)
      
      return () => clearTimeout(hideTimer)
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent",
      className
    )}>
      <div
        className={cn(
          "h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out",
          "shadow-sm"
        )}
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 0.2s ease-out' : 'width 0.3s ease-out'
        }}
      />
    </div>
  )
}

// Hook for managing loading state
export function useLoadingBar() {
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return {
    isLoading,
    startLoading,
    stopLoading,
  }
}
