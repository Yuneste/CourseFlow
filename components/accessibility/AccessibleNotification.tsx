'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ariaLabels } from '@/lib/utils/aria-labels'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface AccessibleNotificationProps {
  type: NotificationType
  title: string
  message?: string
  onClose?: () => void
  autoClose?: boolean
  autoCloseDelay?: number
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }>
  className?: string
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    iconClassName: 'text-green-600 dark:text-green-400',
    role: 'status',
    ariaLive: 'polite' as const
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    iconClassName: 'text-red-600 dark:text-red-400',
    role: 'alert',
    ariaLive: 'assertive' as const
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
    role: 'alert',
    ariaLive: 'polite' as const
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    iconClassName: 'text-blue-600 dark:text-blue-400',
    role: 'status',
    ariaLive: 'polite' as const
  }
}

export function AccessibleNotification({
  type,
  title,
  message,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  actions,
  className
}: AccessibleNotificationProps) {
  const config = notificationConfig[type]
  const Icon = config.icon
  const notificationRef = useRef<HTMLDivElement>(null)
  const titleId = `notification-title-${Date.now()}`
  const messageId = message ? `notification-message-${Date.now()}` : undefined

  useEffect(() => {
    // Focus management for important notifications
    if (type === 'error' && notificationRef.current) {
      notificationRef.current.focus()
    }

    // Auto-close functionality
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [type, autoClose, autoCloseDelay, onClose])

  return (
    <div
      ref={notificationRef}
      role={config.role}
      aria-live={config.ariaLive}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      tabIndex={-1}
      className={cn(
        'flex gap-3 p-4 rounded-lg border',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconClassName)} />
      
      <div className="flex-1 space-y-2">
        <h3 id={titleId} className="font-medium">
          {title}
        </h3>
        
        {message && (
          <p id={messageId} className="text-sm opacity-90">
            {message}
          </p>
        )}
        
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.variant || 'default'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {onClose && (
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 -mt-1 -mr-1"
          onClick={onClose}
          aria-label={ariaLabels.button.dismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Notification stack for managing multiple notifications
interface NotificationStackProps {
  notifications: Array<{
    id: string
    type: NotificationType
    title: string
    message?: string
    autoClose?: boolean
  }>
  onClose: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  className?: string
}

export function NotificationStack({
  notifications,
  onClose,
  position = 'top-right',
  className
}: NotificationStackProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }

  if (notifications.length === 0) return null

  return (
    <div
      className={cn(
        'fixed z-50 pointer-events-none',
        positionClasses[position],
        className
      )}
    >
      <div className="space-y-2 pointer-events-auto">
        {notifications.map((notification) => (
          <AccessibleNotification
            key={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => onClose(notification.id)}
            autoClose={notification.autoClose}
          />
        ))}
      </div>
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      type: NotificationType
      title: string
      message?: string
      autoClose?: boolean
    }>
  >([])

  const show = (
    type: NotificationType,
    title: string,
    options?: {
      message?: string
      autoClose?: boolean
      duration?: number
    }
  ) => {
    const id = `notification-${Date.now()}`
    const notification = {
      id,
      type,
      title,
      message: options?.message,
      autoClose: options?.autoClose ?? true
    }

    setNotifications((prev) => [...prev, notification])

    if (options?.autoClose !== false) {
      setTimeout(() => {
        remove(id)
      }, options?.duration ?? 5000)
    }

    return id
  }

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clear = () => {
    setNotifications([])
  }

  return {
    notifications,
    show,
    remove,
    clear,
    success: (title: string, options?: Parameters<typeof show>[2]) => 
      show('success', title, options),
    error: (title: string, options?: Parameters<typeof show>[2]) => 
      show('error', title, options),
    warning: (title: string, options?: Parameters<typeof show>[2]) => 
      show('warning', title, options),
    info: (title: string, options?: Parameters<typeof show>[2]) => 
      show('info', title, options)
  }
}