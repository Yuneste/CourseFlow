'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, CreditCard, Mail } from 'lucide-react'
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

export class PaymentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Payment error:', error, errorInfo)
    
    // In production, send to error tracking service with high priority
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry with payment context and high priority
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onRetry?.()
  }

  public render() {
    if (this.state.hasError) {
      const isCardDeclined = this.state.error?.message?.includes('declined')
      const isNetworkError = this.state.error?.message?.includes('network')
      const isValidationError = this.state.error?.message?.includes('validation')
      const isStripeError = this.state.error?.message?.includes('stripe')
      
      return (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-center">Payment Error</CardTitle>
            <CardDescription className="text-center">
              {isCardDeclined && "Your card was declined"}
              {isNetworkError && "Connection issue during payment"}
              {isValidationError && "Invalid payment information"}
              {isStripeError && "Payment processor error"}
              {!isCardDeclined && !isNetworkError && !isValidationError && !isStripeError && "Payment could not be processed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isCardDeclined && (
                  <>
                    Please check your card details or try a different payment method. 
                    Contact your bank if the problem persists.
                  </>
                )}
                {isNetworkError && "Please check your internet connection and try again. Your card has not been charged."}
                {isValidationError && "Please check that all payment fields are filled correctly."}
                {isStripeError && "Our payment processor is experiencing issues. Please try again in a few moments."}
                {!isCardDeclined && !isNetworkError && !isValidationError && !isStripeError && (
                  <>
                    An unexpected error occurred. Your card has not been charged. 
                    {process.env.NODE_ENV === 'development' && (
                      <p className="mt-2 text-xs font-mono">{this.state.error?.message}</p>
                    )}
                  </>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Need help?</strong> Our support team is ready to assist you with any payment issues.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={this.handleReset} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href="mailto:billing@courseflow.app">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
}