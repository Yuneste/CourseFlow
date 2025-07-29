import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <LoadingSpinner className="mb-4" />
        <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {message}
        </p>
      </div>
    </div>
  )
}

interface InlineLoadingProps {
  className?: string
}

export function InlineLoading({ className }: InlineLoadingProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="animate-pulse">•</span>
      <span className="animate-pulse animation-delay-200">•</span>
      <span className="animate-pulse animation-delay-400">•</span>
    </span>
  )
}