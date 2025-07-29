'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

// Simple error tracking setup - in production, replace with Sentry or similar
interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: ErrorInfo[] = [];
  private maxErrors = 100;

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  trackError(error: Error, errorInfo?: any) {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : ''
    };

    this.errors.push(errorData);
    
    // Keep only the latest errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToService(errorData);
    } else {
      console.error('Tracked error:', errorData);
    }
  }

  private async sendToService(error: ErrorInfo) {
    // TODO: Implement actual error reporting service integration
    // Example: Sentry, LogRocket, Bugsnag, etc.
    try {
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // });
    } catch (err) {
      console.error('Failed to send error to tracking service:', err);
    }
  }

  getErrors(): ErrorInfo[] {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

// Hook for error tracking
export function useErrorTracking() {
  const tracker = ErrorTracker.getInstance();

  const trackError = (error: Error, errorInfo?: any) => {
    tracker.trackError(error, errorInfo);
  };

  const getErrors = () => tracker.getErrors();
  const clearErrors = () => tracker.clearErrors();

  return { trackError, getErrors, clearErrors };
}

// Global error handler component
export function GlobalErrorHandler() {
  const { trackError } = useErrorTracking();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(
        event.reason?.message || 'Unhandled promise rejection'
      );
      error.stack = event.reason?.stack;
      trackError(error);
      
      // Show user-friendly error message
      toast.error('An unexpected error occurred. Please try again.');
    };

    // Handle global errors
    const handleError = (event: ErrorEvent) => {
      trackError(event.error || new Error(event.message));
      
      // Prevent default error handling
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [trackError]);

  return null;
}

// Analytics event tracker
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

class Analytics {
  private static instance: Analytics;

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  track(event: AnalyticsEvent) {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', event);
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement actual analytics service integration
      // Example: Google Analytics, Mixpanel, Amplitude, etc.
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          ...event.metadata
        });
      }
    }
  }

  // Common event helpers
  pageView(path: string) {
    this.track({
      category: 'Navigation',
      action: 'Page View',
      label: path
    });
  }

  userAction(action: string, label?: string, value?: number) {
    this.track({
      category: 'User Action',
      action,
      label,
      value
    });
  }

  error(message: string, fatal = false) {
    this.track({
      category: 'Error',
      action: fatal ? 'Fatal Error' : 'Error',
      label: message
    });
  }

  timing(category: string, variable: string, time: number) {
    this.track({
      category: 'Performance',
      action: 'Timing',
      label: `${category} - ${variable}`,
      value: time
    });
  }
}

// Hook for analytics
export function useAnalytics() {
  const analytics = Analytics.getInstance();

  return {
    track: (event: AnalyticsEvent) => analytics.track(event),
    pageView: (path: string) => analytics.pageView(path),
    userAction: (action: string, label?: string, value?: number) => 
      analytics.userAction(action, label, value),
    error: (message: string, fatal = false) => analytics.error(message, fatal),
    timing: (category: string, variable: string, time: number) => 
      analytics.timing(category, variable, time)
  };
}

// User feedback component
interface UserFeedbackProps {
  onSubmit: (feedback: { rating: number; comment: string }) => void;
  className?: string;
}

export function UserFeedback({ onSubmit, className }: UserFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onSubmit({ rating, comment });
    setSubmitted(true);
    
    // Reset after delay
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setComment('');
    }, 3000);
  };

  if (submitted) {
    return (
      <div className={cn('text-center p-4', className)}>
        <p className="text-green-600 font-medium">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <p className="text-sm font-medium mb-2">How was your experience?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={cn(
                'text-2xl transition-colors',
                star <= rating ? 'text-yellow-500' : 'text-gray-300'
              )}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Any additional comments? (optional)"
        className="w-full p-2 border rounded-md resize-none"
        rows={3}
      />
      
      <Button
        onClick={handleSubmit}
        disabled={rating === 0}
        className="w-full"
      >
        Submit Feedback
      </Button>
    </div>
  );
}

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';