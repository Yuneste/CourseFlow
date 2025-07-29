import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SPACING } from '@/lib/constants/ui.constants';

interface LoadingStateProps {
  /**
   * Type of loading pattern to display
   */
  variant?: 'card' | 'list' | 'grid' | 'text' | 'custom';
  /**
   * Number of skeleton items to show
   */
  count?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom loading content
   */
  children?: React.ReactNode;
}

/**
 * Reusable loading state component following clean code principles
 */
export function LoadingState({ 
  variant = 'card', 
  count = 3, 
  className,
  children 
}: LoadingStateProps) {
  if (children) {
    return <div className={className}>{children}</div>;
  }

  const renderCardSkeleton = () => (
    <div className="p-6 bg-card rounded-lg border border-border">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <Skeleton className="h-4 w-full" />
    </div>
  );

  const renderListSkeleton = () => (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );

  const renderTextSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );

  const renderSkeletons = () => {
    const skeletons = Array.from({ length: count }, (_, index) => {
      switch (variant) {
        case 'card':
          return <div key={index}>{renderCardSkeleton()}</div>;
        case 'list':
          return <div key={index}>{renderListSkeleton()}</div>;
        case 'text':
          return index === 0 ? <div key={index}>{renderTextSkeleton()}</div> : null;
        default:
          return null;
      }
    });

    return skeletons;
  };

  const containerClasses = {
    card: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    list: 'space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    text: 'space-y-4',
    custom: ''
  };

  return (
    <div className={cn(containerClasses[variant], className)}>
      {renderSkeletons()}
    </div>
  );
}

// Specialized loading components for common use cases
export const CardGridLoading = () => (
  <LoadingState variant="card" count={6} />
);

export const ListLoading = () => (
  <LoadingState variant="list" count={5} />
);

export const TextLoading = () => (
  <LoadingState variant="text" count={1} />
);