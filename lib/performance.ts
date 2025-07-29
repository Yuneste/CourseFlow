import { logger } from './logger'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  rating?: 'good' | 'needs-improvement' | 'poor'
}

// Performance thresholds based on Web Vitals
const thresholds = {
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  FID: { good: 100, poor: 300 },        // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint
}

function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[metric as keyof typeof thresholds]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

export function reportWebVitals(metric: any) {
  const { id, name, value, label } = metric
  
  const performanceMetric: PerformanceMetric = {
    name,
    value: Math.round(value),
    unit: name === 'CLS' ? '' : 'ms',
    rating: getRating(name, value),
  }

  // Log performance metrics
  logger.info(`Web Vital: ${name}`, {
    id,
    value: performanceMetric.value,
    unit: performanceMetric.unit,
    rating: performanceMetric.rating,
    label,
  })

  // Send to analytics in production
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      value: Math.round(value),
      metric_id: id,
      metric_value: value,
      metric_delta: value,
      metric_rating: performanceMetric.rating,
    })
  }

  // You can also send to other monitoring services
  // Example: Send to custom monitoring endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: name,
        value,
        rating: performanceMetric.rating,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(err => logger.error('Failed to send metrics', err))
  }
}

// Custom performance marks and measures
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()

  mark(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      const time = performance.now()
      this.marks.set(name, time)
      performance.mark(name)
    }
  }

  measure(name: string, startMark: string, endMark?: string) {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark)
        } else {
          const startTime = this.marks.get(startMark)
          if (startTime) {
            const duration = performance.now() - startTime
            logger.debug(`Performance: ${name}`, { duration: `${Math.round(duration)}ms` })
            return duration
          }
        }
      } catch (error) {
        logger.error('Performance measurement error', error)
      }
    }
    return null
  }

  // Measure component render time
  measureRender(componentName: string) {
    const startMark = `${componentName}-render-start`
    const endMark = `${componentName}-render-end`
    
    return {
      start: () => this.mark(startMark),
      end: () => {
        this.mark(endMark)
        return this.measure(`${componentName} render`, startMark, endMark)
      }
    }
  }

  // Measure API call duration
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      logger.info(`Performance: ${name}`, { duration: `${Math.round(duration)}ms` })
      return result
    } catch (error) {
      const duration = performance.now() - start
      logger.error(`Performance: ${name} (failed)`, error, { duration: `${Math.round(duration)}ms` })
      throw error
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// React hook for measuring component performance
import { useEffect, useRef } from 'react'

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const renderTimer = useRef<ReturnType<typeof performanceMonitor.measureRender>>()

  useEffect(() => {
    renderCount.current++
    renderTimer.current = performanceMonitor.measureRender(`${componentName}-${renderCount.current}`)
    renderTimer.current.start()
    
    return () => {
      renderTimer.current?.end()
    }
  })
}