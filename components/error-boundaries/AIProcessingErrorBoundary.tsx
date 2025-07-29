'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Sparkles, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  children: ReactNode
  onRetry?: () => void
  onGoBack?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  retryCount: number
}

export class AIProcessingErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    retryCount: 0
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AI processing error:', error, errorInfo)
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry with AI processing context
    }
  }

  private handleRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: null,
      retryCount: prevState.retryCount + 1
    }))
    this.props.onRetry?.()
  }

  private handleGoBack = () => {
    this.setState({ hasError: false, error: null, retryCount: 0 })
    this.props.onGoBack?.()
  }

  public render() {
    if (this.state.hasError) {
      const isRateLimitError = this.state.error?.message?.includes('rate limit')
      const isAPIError = this.state.error?.message?.includes('API')
      const isTimeoutError = this.state.error?.message?.includes('timeout')
      const maxRetriesReached = this.state.retryCount >= 3
      
      return (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-center">AI Processing Error</CardTitle>
            <CardDescription className="text-center">
              {isRateLimitError && "AI service is busy right now"}
              {isAPIError && "Cannot connect to AI service"}
              {isTimeoutError && "AI processing took too long"}
              {!isRateLimitError && !isAPIError && !isTimeoutError && "AI processing failed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isRateLimitError && (
                  <>
                    Too many requests. Please wait a moment before trying again.
                    {this.state.retryCount > 0 && (
                      <p className="mt-2 text-sm">Retry attempt: {this.state.retryCount}/3</p>
                    )}
                  </>
                )}
                {isAPIError && "The AI service is temporarily unavailable. Your files are safe and you can try processing them later."}
                {isTimeoutError && "The AI is taking longer than expected. Try processing fewer files at once."}
                {!isRateLimitError && !isAPIError && !isTimeoutError && (
                  process.env.NODE_ENV === 'development' 
                    ? this.state.error?.message 
                    : "Something went wrong with AI processing. Your files are safe."
                )}
              </AlertDescription>
            </Alert>
            
            {maxRetriesReached && (
              <Alert variant="destructive">
                <AlertDescription>
                  Maximum retry attempts reached. Please try again later or contact support.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            {!maxRetriesReached && (
              <Button 
                onClick={this.handleRetry} 
                className="flex-1"
                disabled={isRateLimitError && this.state.retryCount > 0}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={this.handleGoBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
}