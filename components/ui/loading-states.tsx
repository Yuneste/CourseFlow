'use client';

import { LoadingSpinner } from './loading-spinner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  fullScreen?: boolean;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  text = "Loading...",
  fullScreen = false,
  blur = true,
  className
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "flex items-center justify-center z-50",
            fullScreen ? "fixed inset-0" : "absolute inset-0",
            blur && "backdrop-blur-sm",
            "bg-background/80",
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6"
          >
            <LoadingSpinner size="lg" text={text} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AsyncWrapperProps {
  isLoading: boolean;
  error?: Error | string | null;
  skeleton?: React.ReactNode;
  loadingText?: string;
  children: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}

export function AsyncWrapper({
  isLoading,
  error,
  skeleton,
  loadingText,
  children,
  onRetry,
  className
}: AsyncWrapperProps) {
  if (isLoading) {
    return skeleton || <LoadingSpinner size="lg" text={loadingText} className={className} />;
  }

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {typeof error === 'string' ? error : error.message}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

interface LazyLoadWrapperProps {
  threshold?: number;
  rootMargin?: string;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
}

export function LazyLoadWrapper({
  threshold = 0.1,
  rootMargin = "50px",
  children,
  skeleton,
  className
}: LazyLoadWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : skeleton || <div className="h-32" />}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';

interface PaginationLoaderProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  loader?: React.ReactNode;
  className?: string;
}

export function PaginationLoader({
  hasMore,
  isLoading,
  onLoadMore,
  loader,
  className
}: PaginationLoaderProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div ref={ref} className={cn("flex justify-center py-4", className)}>
      {isLoading && (loader || <LoadingSpinner size="md" />)}
    </div>
  );
}