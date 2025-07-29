'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  onRetry?: () => void;
}

export function FeatureErrorBoundary({ 
  children, 
  featureName,
  onRetry 
}: FeatureErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {featureName} is temporarily unavailable
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            We're having trouble loading this feature. Please try again.
          </p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Course-specific error boundary
export function CourseErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <FeatureErrorBoundary 
      featureName="Course Management"
      onRetry={() => window.location.reload()}
    >
      {children}
    </FeatureErrorBoundary>
  );
}

// File upload error boundary
export function FileUploadErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <FeatureErrorBoundary 
      featureName="File Upload"
      onRetry={() => window.location.reload()}
    >
      {children}
    </FeatureErrorBoundary>
  );
}

// Study mode error boundary
export function StudyModeErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <FeatureErrorBoundary 
      featureName="Study Mode"
      onRetry={() => window.location.reload()}
    >
      {children}
    </FeatureErrorBoundary>
  );
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = () => setError(null);
  const captureError = (error: Error) => setError(error);

  return { resetError, captureError };
}

// Async error boundary for handling promise rejections
interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AsyncErrorBoundary({ children, fallback }: AsyncErrorBoundaryProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return fallback || (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          An unexpected error occurred. Please refresh the page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}