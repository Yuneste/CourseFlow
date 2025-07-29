'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  children: ReactNode
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class FileUploadErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('File upload error:', error, errorInfo)
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry with file upload context
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onRetry?.()
  }

  public render() {
    if (this.state.hasError) {
      const isQuotaError = this.state.error?.message?.includes('quota')
      const isNetworkError = this.state.error?.message?.includes('network')
      const isFileTypeError = this.state.error?.message?.includes('file type')
      
      return (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-center">Upload Failed</CardTitle>
            <CardDescription className="text-center">
              {isQuotaError && "You've reached your storage limit"}
              {isNetworkError && "Network connection issue"}
              {isFileTypeError && "Invalid file type"}
              {!isQuotaError && !isNetworkError && !isFileTypeError && "Failed to upload your file"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isQuotaError && (
                  <>
                    Upgrade to a higher plan for more storage space.
                    <Button variant="link" className="px-0 h-auto" asChild>
                      <a href="/dashboard/billing">View Plans</a>
                    </Button>
                  </>
                )}
                {isNetworkError && "Please check your internet connection and try again."}
                {isFileTypeError && "Please upload a supported file type (PDF, DOCX, TXT, etc.)."}
                {!isQuotaError && !isNetworkError && !isFileTypeError && (
                  process.env.NODE_ENV === 'development' 
                    ? this.state.error?.message 
                    : "An unexpected error occurred. Please try again."
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={this.handleReset} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href="/support">Get Help</a>
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
}