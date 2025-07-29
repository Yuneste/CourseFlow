'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// Analytics event types
type EventCategory = 'User' | 'Navigation' | 'Performance' | 'Error' | 'Feature' | 'Conversion'
type EventAction = string
type EventLabel = string
type EventValue = number

interface AnalyticsEvent {
  category: EventCategory
  action: EventAction
  label?: EventLabel
  value?: EventValue
  metadata?: Record<string, any>
}

// Enhanced analytics hook with automatic tracking
export function useEnhancedAnalytics() {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)

  // Track page views automatically
  useEffect(() => {
    if (pathname !== previousPathname.current) {
      trackPageView(pathname)
      previousPathname.current = pathname
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Core tracking function
  const track = useCallback((event: AnalyticsEvent) => {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event)
    }

    // Production tracking
    if (process.env.NODE_ENV === 'production') {
      // Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          ...event.metadata
        })
      }

      // Additional analytics services can be added here
      // Example: Mixpanel, Amplitude, Segment, etc.
    }
  }, [])

  // Page view tracking
  const trackPageView = useCallback((path: string) => {
    track({
      category: 'Navigation',
      action: 'page_view',
      label: path,
      metadata: {
        page_path: path,
        page_title: document.title
      }
    })
  }, [track])

  // User interaction tracking
  const trackClick = useCallback((elementName: string, elementType?: string) => {
    track({
      category: 'User',
      action: 'click',
      label: elementName,
      metadata: { element_type: elementType }
    })
  }, [track])

  // Feature usage tracking
  const trackFeatureUsage = useCallback((featureName: string, action: string) => {
    track({
      category: 'Feature',
      action: `${featureName}_${action}`,
      label: featureName
    })
  }, [track])

  // Conversion tracking
  const trackConversion = useCallback((conversionType: string, value?: number) => {
    track({
      category: 'Conversion',
      action: conversionType,
      value,
      metadata: { timestamp: new Date().toISOString() }
    })
  }, [track])

  // Performance tracking
  const trackTiming = useCallback((category: string, variable: string, time: number) => {
    track({
      category: 'Performance',
      action: 'timing',
      label: `${category}_${variable}`,
      value: Math.round(time)
    })
  }, [track])

  // Error tracking
  const trackError = useCallback((errorType: string, errorMessage: string, fatal = false) => {
    track({
      category: 'Error',
      action: fatal ? 'fatal_error' : 'error',
      label: errorType,
      metadata: { 
        error_message: errorMessage,
        fatal,
        url: window.location.href
      }
    })
  }, [track])

  return {
    track,
    trackPageView,
    trackClick,
    trackFeatureUsage,
    trackConversion,
    trackTiming,
    trackError
  }
}

// Hook for tracking component visibility
export function useVisibilityTracking(componentName: string, threshold = 0.5) {
  const elementRef = useRef<HTMLElement>(null)
  const hasBeenVisible = useRef(false)
  const { track } = useEnhancedAnalytics()

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisible.current) {
            hasBeenVisible.current = true
            track({
              category: 'User',
              action: 'component_viewed',
              label: componentName
            })
          }
        })
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [componentName, threshold, track])

  return elementRef
}

// Hook for tracking time spent
export function useTimeTracking(featureName: string) {
  const startTimeRef = useRef<number>()
  const { trackTiming } = useEnhancedAnalytics()

  useEffect(() => {
    startTimeRef.current = Date.now()

    return () => {
      if (startTimeRef.current) {
        const timeSpent = Date.now() - startTimeRef.current
        trackTiming(featureName, 'time_spent', timeSpent)
      }
    }
  }, [featureName, trackTiming])
}

// Hook for A/B testing
export function useABTest(testName: string, variants: string[]): string {
  const [variant, setVariant] = useState<string>('')
  const { track } = useEnhancedAnalytics()

  useEffect(() => {
    // Get or assign variant
    const storageKey = `ab_test_${testName}`
    let assignedVariant = localStorage.getItem(storageKey)

    if (!assignedVariant) {
      // Randomly assign variant
      assignedVariant = variants[Math.floor(Math.random() * variants.length)]
      localStorage.setItem(storageKey, assignedVariant)
    }

    setVariant(assignedVariant)

    // Track variant assignment
    track({
      category: 'Feature',
      action: 'ab_test_assignment',
      label: testName,
      metadata: { variant: assignedVariant }
    })
  }, [testName, variants, track])

  return variant
}

// Hook for funnel tracking
export function useFunnelTracking(funnelName: string) {
  const { track } = useEnhancedAnalytics()
  const stepRef = useRef(0)

  const trackStep = useCallback((stepName: string, metadata?: Record<string, any>) => {
    stepRef.current += 1
    track({
      category: 'Conversion',
      action: 'funnel_step',
      label: `${funnelName}_${stepName}`,
      value: stepRef.current,
      metadata: {
        funnel_name: funnelName,
        step_name: stepName,
        step_number: stepRef.current,
        ...metadata
      }
    })
  }, [funnelName, track])

  const trackCompletion = useCallback((metadata?: Record<string, any>) => {
    track({
      category: 'Conversion',
      action: 'funnel_completed',
      label: funnelName,
      value: stepRef.current,
      metadata: {
        funnel_name: funnelName,
        total_steps: stepRef.current,
        ...metadata
      }
    })
  }, [funnelName, track])

  const trackAbandonment = useCallback((reason?: string) => {
    track({
      category: 'Conversion',
      action: 'funnel_abandoned',
      label: funnelName,
      value: stepRef.current,
      metadata: {
        funnel_name: funnelName,
        abandoned_at_step: stepRef.current,
        reason
      }
    })
  }, [funnelName, track])

  return {
    trackStep,
    trackCompletion,
    trackAbandonment
  }
}