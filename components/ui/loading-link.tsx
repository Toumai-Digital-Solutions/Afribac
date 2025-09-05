'use client'

import Link from 'next/link'
import { useNavigationLoading } from '@/hooks/use-navigation-loading'
import { MouseEvent } from 'react'

interface LoadingLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  replace?: boolean
  [key: string]: any
}

export function LoadingLink({ 
  href, 
  children, 
  className, 
  replace = false, 
  onClick,
  ...props 
}: LoadingLinkProps) {
  const { push, replace: routerReplace, startLoading } = useNavigationLoading()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(e)
    }

    // Only handle if not prevented and not external link
    if (!e.defaultPrevented && href.startsWith('/')) {
      e.preventDefault()
      if (replace) {
        routerReplace(href)
      } else {
        push(href)
      }
    }
  }

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  )
}
