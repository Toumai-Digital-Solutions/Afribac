'use client'

import { useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useLoading } from '@/components/providers/loading-provider'

export function useNavigationLoading() {
  const { startLoading, stopLoading } = useLoading()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Stop loading when route changes
    stopLoading()
  }, [pathname, searchParams, stopLoading])

  // Enhanced router with loading
  const navigateWithLoading = {
    push: (href: string) => {
      startLoading()
      router.push(href)
    },
    replace: (href: string) => {
      startLoading()
      router.replace(href)
    },
    back: () => {
      startLoading()
      router.back()
    },
    forward: () => {
      startLoading()
      router.forward()
    },
    refresh: () => {
      startLoading()
      router.refresh()
    }
  }

  return {
    ...navigateWithLoading,
    startLoading,
    stopLoading,
  }
}
