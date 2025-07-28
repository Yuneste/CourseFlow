'use client'

import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface FeatureErrorBoundaryProps {
  children: React.ReactNode
  featureName: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export function FeatureErrorBoundary({ 
  children, 
  featureName,
  onError 
}: FeatureErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error in {featureName}</AlertTitle>
          <AlertDescription>
            This feature encountered an error and couldn&apos;t load properly. 
            Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      }
    >
      {children}
    </ErrorBoundary>
  )
}