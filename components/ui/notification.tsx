"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface NotificationProps {
  id?: string
  title: string
  description?: string
  variant: "success" | "warning" | "error" | "info"
  duration?: number // in milliseconds, 0 means permanent
  onClose?: () => void
  className?: string
}

export function Notification({
  id,
  title,
  description,
  variant,
  duration = 5000,
  onClose,
  className
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 150)
  }

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case "info":
        return <Info className="h-5 w-5 text-primary" />
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-success/10"
      case "warning":
        return "border-warning/20 bg-warning/10"
      case "error":
        return "border-destructive/20 bg-destructive/10"
      case "info":
        return "border-primary/20 bg-primary/10"
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200",
        getVariantStyles(),
        isAnimating && "translate-x-full opacity-0",
        className
      )}
    >
      {/* Icon */}
      <div className="mt-0.5">{getIcon()}</div>
      
      {/* Content */}
      <div className="flex-1 space-y-1">
        <h4 className="font-medium text-sm">{title}</h4>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Notification Container for managing multiple notifications
interface NotificationContainerProps {
  notifications: (NotificationProps & { id: string })[]
  onRemove: (id: string) => void
}

export function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<(NotificationProps & { id: string })[]>([])

  const addNotification = (notification: Omit<NotificationProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 15)
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Convenience methods
  const success = (title: string, description?: string) => {
    addNotification({ title, description, variant: "success" })
  }

  const error = (title: string, description?: string) => {
    addNotification({ title, description, variant: "error" })
  }

  const warning = (title: string, description?: string) => {
    addNotification({ title, description, variant: "warning" })
  }

  const info = (title: string, description?: string) => {
    addNotification({ title, description, variant: "info" })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
