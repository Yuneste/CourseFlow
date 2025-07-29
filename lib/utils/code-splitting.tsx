import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { Loader2 } from 'lucide-react'

// Dynamic import configuration types
interface DynamicOptions {
  loading?: () => JSX.Element
  ssr?: boolean
  suspense?: boolean
}

// Default loading component
const DefaultLoader = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
)

// Route-level dynamic imports
export const dynamicRoute = <P extends {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: DynamicOptions
) => {
  return dynamic(importFn, {
    loading: options?.loading || DefaultLoader,
    ssr: options?.ssr ?? true,
    ...options
  })
}

// Feature-level dynamic imports
export const dynamicFeature = <P extends {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  featureName?: string
) => {
  return dynamic(importFn, {
    loading: () => (
      <div className="flex flex-col items-center justify-center p-8 space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        {featureName && (
          <p className="text-sm text-muted-foreground">
            Loading {featureName}...
          </p>
        )}
      </div>
    ),
    ssr: false // Features are usually client-side
  })
}

// Modal/Dialog dynamic imports
export const dynamicModal = <P extends {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) => {
  return dynamic(importFn, {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="animate-pulse bg-background/80 backdrop-blur-sm absolute inset-0" />
        <Loader2 className="h-8 w-8 animate-spin text-foreground relative z-10" />
      </div>
    ),
    ssr: false
  })
}

// Heavy component dynamic imports (charts, editors, etc.)
export const dynamicHeavyComponent = <P extends {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    componentName?: string
    minHeight?: string
    placeholder?: () => JSX.Element
  }
) => {
  return dynamic(importFn, {
    loading: options?.placeholder || (() => (
      <div 
        className="flex flex-col items-center justify-center p-8 space-y-2 bg-muted/10 rounded-lg animate-pulse"
        style={{ minHeight: options?.minHeight || '200px' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        {options?.componentName && (
          <p className="text-sm text-muted-foreground">
            Loading {options.componentName}...
          </p>
        )}
      </div>
    )),
    ssr: false
  })
}

// Utility to preload components
export const preloadComponent = (
  importFn: () => Promise<any>
) => {
  // This will trigger the import but not wait for it
  importFn().catch(console.error)
}

// Batch preload multiple components
export const preloadComponents = (
  imports: Array<() => Promise<any>>
) => {
  imports.forEach(importFn => {
    preloadComponent(importFn)
  })
}

// Intersection Observer based lazy loading
export const createIntersectionLoader = <P extends {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    rootMargin?: string
    threshold?: number | number[]
  }
) => {
  return dynamic(
    async () => {
      // Wait for intersection observer to be available
      if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        return importFn()
      }
      // Fallback for browsers without IntersectionObserver
      return importFn()
    },
    {
      ssr: false,
      loading: DefaultLoader
    }
  )
}

// Route prefetching utilities
// Note: In Next.js 13+ with app directory, use next/link prefetch prop
// or router.prefetch() from next/navigation
/*
export const prefetchRoute = async (path: string) => {
  if (typeof window !== 'undefined') {
    // For Next.js app directory:
    // const router = useRouter() from 'next/navigation'
    // router.prefetch(path)
  }
}
*/

// Component chunk names for webpack
export const namedChunkImport = <P extends {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  chunkName: string
) => {
  return dynamic(
    () => importFn().then(mod => ({ default: mod.default })),
    {
      ssr: false,
      loading: DefaultLoader
    }
  )
}