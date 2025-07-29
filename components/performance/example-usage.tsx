// Example of how to use code splitting in components and pages

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  LazyFileUploadModal, 
  LazyAnalyticsDashboard,
  LazyPDFViewer 
} from './LazyComponents'
import { preloadComponent } from '@/lib/utils/code-splitting'

// Example: Dashboard page with lazy-loaded sections
export function DashboardWithCodeSplitting() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null)

  // Preload analytics when user might access it
  const handleAnalyticsHover = () => {
    // Example: preload component on hover
    // preloadComponent(() => import('@/components/features/analytics/AnalyticsDashboard'))
  }

  return (
    <div className="space-y-6">
      {/* Main content - loaded immediately */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button onClick={() => setShowUploadModal(true)}>
          Upload Files
        </Button>
        
        <Button 
          onClick={() => setShowAnalytics(!showAnalytics)}
          onMouseEnter={handleAnalyticsHover}
        >
          View Analytics
        </Button>
      </div>

      {/* Lazy loaded upload modal */}
      {showUploadModal && (
        <LazyFileUploadModal 
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* Lazy loaded analytics section */}
      {showAnalytics && (
        <LazyAnalyticsDashboard />
      )}

      {/* Lazy loaded PDF viewer */}
      {selectedPdf && (
        <LazyPDFViewer 
          fileUrl={selectedPdf}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  )
}

// Example: Route with code splitting
'use client'

import dynamic from 'next/dynamic'
import { CodeSplitBoundary } from './CodeSplitBoundary'

// Split heavy features into separate chunks
// Example: Replace with actual component path
const HeavyFeature = () => <div>Heavy Feature Placeholder</div>

export function FeaturePage() {
  return (
    <CodeSplitBoundary>
      <div className="container mx-auto p-6">
        <h1>Feature Page</h1>
        
        {/* This component will be loaded in a separate chunk */}
        <HeavyFeature />
      </div>
    </CodeSplitBoundary>
  )
}

// Example: Intersection-based lazy loading
// Note: This example requires 'react-intersection-observer' package
// npm install react-intersection-observer

/*
export function LazyLoadOnScroll() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const [Component, setComponent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    if (inView && !Component) {
      // Example: Load heavy component when in view
      import('@/components/features/heavy/HeavyChart').then(module => {
        setComponent(() => module.default)
      })
    }
  }, [inView, Component])

  return (
    <div ref={ref} className="min-h-[400px]">
      {Component ? (
        <Component />
      ) : (
        <div className="flex items-center justify-center h-[400px] bg-muted/10 rounded-lg">
          <p className="text-muted-foreground">Scroll to load chart</p>
        </div>
      )}
    </div>
  )
}
*/