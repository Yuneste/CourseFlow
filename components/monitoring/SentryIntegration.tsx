'use client'

import { useEffect } from 'react'
// Note: To use Sentry, install the package:
// npm install @sentry/nextjs
// import { ErrorBoundary } from '@sentry/nextjs'
// import { captureException, withScope } from '@sentry/nextjs'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

// Temporary placeholder for Sentry types
const ErrorBoundary = ({ children, fallback, showDialog, onError }: any) => children
const captureException = (error: any) => console.error('Sentry not installed:', error)
const withScope = (callback: any) => callback({ setContext: () => {}, setTag: () => {}, setFingerprint: () => {}, setLevel: () => {} })

// Sentry Error Boundary wrapper component
interface SentryErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  showDialog?: boolean
  onError?: (error: Error, errorInfo: any) => void
}

export function SentryErrorBoundary({
  children,
  fallback,
  showDialog = false,
  onError
}: SentryErrorBoundaryProps) {
  const DefaultFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {error.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetError}
              >
                Try again
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reload page
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary
      fallback={fallback || DefaultFallback}
      showDialog={showDialog}
      onError={(error: Error, errorInfo: any) => {
        // Custom error handling
        if (onError) {
          onError(error, errorInfo)
        }
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error caught by Sentry:', error, errorInfo)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Error tracking wrapper for specific components
interface ErrorTrackingWrapperProps {
  children: React.ReactNode
  context?: Record<string, any>
  level?: 'error' | 'warning' | 'info'
  fingerprint?: string[]
  tags?: Record<string, string>
}

export function ErrorTrackingWrapper({
  children,
  context,
  level = 'error',
  fingerprint,
  tags
}: ErrorTrackingWrapperProps) {
  useEffect(() => {
    // Set up error context when component mounts
    if (context || tags || fingerprint) {
      withScope((scope: any) => {
        if (context) {
          scope.setContext('component', context)
        }
        if (tags) {
          Object.entries(tags).forEach(([key, value]) => {
            scope.setTag(key, value)
          })
        }
        if (fingerprint) {
          scope.setFingerprint(fingerprint)
        }
        if (level) {
          scope.setLevel(level)
        }
      })
    }
  }, [context, tags, fingerprint, level])

  return <>{children}</>
}

// Hook for manual error tracking
export function useSentryErrorTracking() {
  const trackError = (error: Error | string, context?: Record<string, any>) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    
    withScope((scope: any) => {
      if (context) {
        scope.setContext('manual_error', context)
      }
      captureException(errorObj)
    })
  }

  const trackMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    withScope((scope: any) => {
      scope.setLevel(level)
      captureException(new Error(message))
    })
  }

  return {
    trackError,
    trackMessage
  }
}

// Performance monitoring wrapper
interface SentryPerformanceMonitorProps {
  name: string
  children: React.ReactNode
}

export function SentryPerformanceMonitor({ name, children }: SentryPerformanceMonitorProps) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Track render time
      if (typeof window !== 'undefined' && window.performance) {
        performance.measure(name, {
          start: startTime,
          end: endTime
        })
        
        // Log slow renders
        if (duration > 100) {
          console.warn(`Slow render detected for ${name}: ${duration.toFixed(2)}ms`)
        }
      }
    }
  }, [name])

  return <>{children}</>
}

// Debug mode indicator
export function DebugModeIndicator() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium">
        Debug Mode
      </div>
    </div>
  )
}