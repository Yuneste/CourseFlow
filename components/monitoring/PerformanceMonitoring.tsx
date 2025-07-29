'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Performance metrics hook
export function usePerformanceMetrics(options: { enabled?: boolean } = {}) {
  const { enabled = false } = options // Disabled by default to avoid performance impact
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0,
    renderTime: 0
  })

  useEffect(() => {
    if (!enabled) return

    // FPS monitoring - only when enabled to avoid performance impact
    let lastTime = performance.now()
    let frames = 0
    let rafId: number

    const measureFPS = () => {
      frames++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frames * 1000) / (currentTime - lastTime))
        }))
        frames = 0
        lastTime = currentTime
      }
      
      rafId = requestAnimationFrame(measureFPS)
    }

    // Only start FPS monitoring if explicitly enabled
    if (enabled) {
      measureFPS()
    }

    // Memory monitoring (if available)
    const measureMemory = () => {
      if ('memory' in performance && navigator.userAgent.includes('Chrome')) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memory: Math.round(memory.usedJSHeapSize / 1048576) // Convert to MB
        }))
      }
    }

    const memoryInterval = enabled ? setInterval(measureMemory, 5000) : null // Less frequent updates

    // Use Navigation Timing API v2 if available
    if ('PerformanceNavigationTiming' in window) {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (perfData) {
        setMetrics(prev => ({ ...prev, loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart) }))
      }
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (memoryInterval) clearInterval(memoryInterval)
    }
  }, [enabled])

  return metrics
}

// Component render time hook
export function useRenderTime(componentName: string) {
  const renderStartRef = useRef<number>()
  const [renderTime, setRenderTime] = useState<number>(0)

  useEffect(() => {
    renderStartRef.current = performance.now()
    
    // Measure after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (renderStartRef.current) {
          const time = performance.now() - renderStartRef.current
          setRenderTime(time)
          
          // Log slow renders
          if (time > 16.67) { // Slower than 60fps
            console.warn(`Slow render detected for ${componentName}: ${time.toFixed(2)}ms`)
          }
        }
      })
    })
  }, [componentName])

  return renderTime
}

// Performance observer hook
export function usePerformanceObserver(callback: (entries: PerformanceEntry[]) => void) {
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries())
    })

    observer.observe({ 
      entryTypes: ['navigation', 'resource', 'paint', 'measure', 'mark'] 
    })

    return () => observer.disconnect()
  }, [callback])
}

// Performance monitor component (development only)
export function PerformanceMonitor() {
  const metrics = usePerformanceMetrics()
  const [isVisible, setIsVisible] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-black text-white p-2 rounded-full text-xs font-mono"
      >
        {metrics.fps} FPS
      </button>
      
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-black text-white p-4 rounded-lg font-mono text-xs space-y-1">
          <div>FPS: {metrics.fps}</div>
          {metrics.memory > 0 && <div>Memory: {metrics.memory} MB</div>}
          {metrics.loadTime > 0 && <div>Load Time: {metrics.loadTime}ms</div>}
        </div>
      )}
    </>
  )
}

// Web Vitals tracking
interface WebVitalsMetrics {
  lcp?: number  // Largest Contentful Paint
  fid?: number  // First Input Delay
  cls?: number  // Cumulative Layout Shift
  fcp?: number  // First Contentful Paint
  ttfb?: number // Time to First Byte
}

export function useWebVitals(onReport?: (metrics: WebVitalsMetrics) => void) {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Note: To use web-vitals, install the package:
    // npm install web-vitals
    
    // Then uncomment the following code:
    /*
    import('web-vitals').then((webVitals) => {
      webVitals.onCLS?.((metric) => {
        setMetrics(prev => ({ ...prev, cls: metric.value }))
        onReport?.({ ...metrics, cls: metric.value })
      })
      
      webVitals.onFID?.((metric) => {
        setMetrics(prev => ({ ...prev, fid: metric.value }))
        onReport?.({ ...metrics, fid: metric.value })
      })
      
      webVitals.onLCP?.((metric) => {
        setMetrics(prev => ({ ...prev, lcp: metric.value }))
        onReport?.({ ...metrics, lcp: metric.value })
      })
      
      webVitals.onFCP?.((metric) => {
        setMetrics(prev => ({ ...prev, fcp: metric.value }))
        onReport?.({ ...metrics, fcp: metric.value })
      })
      
      webVitals.onTTFB?.((metric) => {
        setMetrics(prev => ({ ...prev, ttfb: metric.value }))
        onReport?.({ ...metrics, ttfb: metric.value })
      })
    }).catch(() => {
      // web-vitals not available
    })
    */
  }, [])

  return metrics
}

// Bundle size analyzer (build-time)
export function BundleAnalyzer() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-100 text-yellow-900 p-2 rounded text-xs">
      Bundle analyzer available in build
    </div>
  )
}

// Resource timing hook
export function useResourceTiming() {
  const [resources, setResources] = useState<PerformanceResourceTiming[]>([])

  useEffect(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    setResources(entries)

    // Monitor new resources
    const observer = new PerformanceObserver((list) => {
      const newEntries = list.getEntriesByType('resource') as PerformanceResourceTiming[]
      setResources(prev => [...prev, ...newEntries])
    })

    observer.observe({ entryTypes: ['resource'] })
    return () => observer.disconnect()
  }, [])

  const getSlowResources = (threshold = 1000) => {
    return resources.filter(r => r.duration > threshold)
  }

  const getResourcesByType = (type: string) => {
    return resources.filter(r => r.initiatorType === type)
  }

  return {
    resources,
    getSlowResources,
    getResourcesByType
  }
}