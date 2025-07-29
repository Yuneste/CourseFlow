'use client'

import { Suspense, lazy, ComponentType, ReactElement } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeSplitBoundaryProps {
  children: ReactElement
  fallback?: ReactElement
  className?: string
}

// Default loading component
function DefaultLoadingFallback({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

// Code splitting boundary component
export function CodeSplitBoundary({ 
  children, 
  fallback, 
  className 
}: CodeSplitBoundaryProps) {
  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback className={className} />}>
      {children}
    </Suspense>
  )
}

// Helper function to create lazy-loaded components with error boundary
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await importFn()
    } catch (error) {
      console.error('Failed to load component:', error)
      // Return a fallback component in case of error
      return {
        default: ((() => (
          <div className="p-4 text-center text-muted-foreground">
            Failed to load component. Please refresh the page.
          </div>
        )) as unknown) as T
      }
    }
  })
}

// Route-level code splitting helper
export function createRouteSplitBoundary(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options?: {
    fallback?: ReactElement
    errorFallback?: ReactElement
  }
) {
  const LazyComponent = createLazyComponent(importFn)
  
  return function RouteSplitBoundary(props: any) {
    return (
      <CodeSplitBoundary fallback={options?.fallback}>
        <LazyComponent {...props} />
      </CodeSplitBoundary>
    )
  }
}

// Feature-level code splitting helper
export function createFeatureSplitBoundary(
  featureName: string,
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  const LazyComponent = createLazyComponent(importFn)
  
  return function FeatureSplitBoundary(props: any) {
    return (
      <CodeSplitBoundary 
        fallback={
          <div className="flex flex-col items-center justify-center p-8 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading {featureName}...
            </p>
          </div>
        }
      >
        <LazyComponent {...props} />
      </CodeSplitBoundary>
    )
  }
}

// Modal/Dialog code splitting helper
export function createModalSplitBoundary(
  modalName: string,
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  const LazyModal = createLazyComponent(importFn)
  
  return function ModalSplitBoundary(props: any) {
    // For modals, we might want a more subtle loading state
    return (
      <CodeSplitBoundary 
        fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <LazyModal {...props} />
      </CodeSplitBoundary>
    )
  }
}

// Heavy component code splitting helper (charts, editors, etc.)
export function createHeavyComponentBoundary(
  componentName: string,
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options?: {
    minHeight?: string
    showComponentName?: boolean
  }
) {
  const LazyComponent = createLazyComponent(importFn)
  
  return function HeavyComponentBoundary(props: any) {
    return (
      <CodeSplitBoundary 
        fallback={
          <div 
            className="flex flex-col items-center justify-center p-8 space-y-2 bg-muted/10 rounded-lg"
            style={{ minHeight: options?.minHeight || '200px' }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            {options?.showComponentName !== false && (
              <p className="text-sm text-muted-foreground">
                Loading {componentName}...
              </p>
            )}
          </div>
        }
      >
        <LazyComponent {...props} />
      </CodeSplitBoundary>
    )
  }
}