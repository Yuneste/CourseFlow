'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type AriaLive = 'polite' | 'assertive' | 'off'
type AriaRelevant = 'additions' | 'removals' | 'text' | 'all' | 'additions text' | 'additions removals' | 'removals text' | 'additions removals text'

interface AriaLiveRegionProps {
  children?: React.ReactNode
  live?: AriaLive
  atomic?: boolean
  relevant?: AriaRelevant | AriaRelevant[]
  className?: string
  visuallyHidden?: boolean
}

export function AriaLiveRegion({
  children,
  live = 'polite',
  atomic = true,
  relevant = 'additions text',
  className,
  visuallyHidden = true
}: AriaLiveRegionProps) {
  const relevantValue = Array.isArray(relevant) ? relevant.join(' ') : relevant

  return (
    <div
      role="status"
      aria-live={live}
      aria-atomic={atomic}
      aria-relevant={relevantValue as any}
      className={cn(
        visuallyHidden && 'sr-only',
        className
      )}
    >
      {children}
    </div>
  )
}

// Hook for announcing messages to screen readers
export function useAnnouncer() {
  const [announcement, setAnnouncement] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout>()

  const announce = (message: string, options?: {
    priority?: 'polite' | 'assertive'
    clearAfter?: number
  }) => {
    const { clearAfter = 1000 } = options || {}
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set the announcement
    setAnnouncement(message)

    // Clear after specified time
    if (clearAfter > 0) {
      timeoutRef.current = setTimeout(() => {
        setAnnouncement('')
      }, clearAfter)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { announcement, announce }
}

// Status announcer component
interface StatusAnnouncerProps {
  message: string
  priority?: 'polite' | 'assertive'
  clearAfter?: number
}

export function StatusAnnouncer({ 
  message, 
  priority = 'polite',
  clearAfter = 1000 
}: StatusAnnouncerProps) {
  const [currentMessage, setCurrentMessage] = useState(message)

  useEffect(() => {
    setCurrentMessage(message)
    
    if (clearAfter > 0 && message) {
      const timeout = setTimeout(() => {
        setCurrentMessage('')
      }, clearAfter)
      
      return () => clearTimeout(timeout)
    }
  }, [message, clearAfter])

  if (!currentMessage) return null

  return (
    <AriaLiveRegion live={priority}>
      {currentMessage}
    </AriaLiveRegion>
  )
}

// Loading announcer for async operations
interface LoadingAnnouncerProps {
  loading: boolean
  loadingMessage?: string
  completeMessage?: string
  errorMessage?: string
  error?: boolean
}

export function LoadingAnnouncer({
  loading,
  loadingMessage = 'Loading...',
  completeMessage = 'Loading complete',
  errorMessage = 'Loading failed',
  error = false
}: LoadingAnnouncerProps) {
  const [announced, setAnnounced] = useState(false)

  useEffect(() => {
    if (loading && !announced) {
      setAnnounced(true)
    } else if (!loading && announced) {
      setAnnounced(false)
    }
  }, [loading, announced])

  return (
    <AriaLiveRegion live="polite">
      {loading && loadingMessage}
      {!loading && announced && (error ? errorMessage : completeMessage)}
    </AriaLiveRegion>
  )
}

// Form validation announcer
interface ValidationAnnouncerProps {
  errors: Record<string, string | string[]>
  touched?: Record<string, boolean>
  announceOn?: 'change' | 'blur' | 'submit'
}

export function ValidationAnnouncer({
  errors,
  touched = {},
  announceOn = 'change'
}: ValidationAnnouncerProps) {
  const [announcements, setAnnouncements] = useState<string[]>([])

  useEffect(() => {
    const errorMessages: string[] = []
    
    Object.entries(errors).forEach(([field, error]) => {
      if (touched[field] || announceOn === 'submit') {
        const errorMessage = Array.isArray(error) ? error.join(', ') : error
        if (errorMessage) {
          errorMessages.push(`${field}: ${errorMessage}`)
        }
      }
    })

    setAnnouncements(errorMessages)
  }, [errors, touched, announceOn])

  if (announcements.length === 0) return null

  return (
    <AriaLiveRegion live="polite" atomic={false}>
      <ul>
        {announcements.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </AriaLiveRegion>
  )
}

// Route change announcer
interface RouteAnnouncerProps {
  message?: string
  format?: (pathname: string) => string
}

export function RouteAnnouncer({ 
  message,
  format = (pathname) => `Navigated to ${pathname}`
}: RouteAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleRouteChange = () => {
        const newMessage = message || format(window.location.pathname)
        setAnnouncement(newMessage)
        
        // Clear after announcement
        setTimeout(() => setAnnouncement(''), 1000)
      }

      // Listen for route changes (you might need to integrate with your router)
      window.addEventListener('popstate', handleRouteChange)
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange)
      }
    }
  }, [message, format])

  return (
    <AriaLiveRegion live="assertive">
      {announcement}
    </AriaLiveRegion>
  )
}