'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import React from 'react';

interface TouchFriendlyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

// Enhanced button with minimum 44px touch target
export const TouchFriendlyButton = React.forwardRef<HTMLButtonElement, TouchFriendlyButtonProps>(
  ({ className, size = 'default', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          // Ensure minimum touch target size on mobile
          'min-h-[44px] min-w-[44px] touch-manipulation',
          // Add active state feedback
          'active:scale-95 transition-transform',
          className
        )}
        {...props}
      />
    );
  }
);
TouchFriendlyButton.displayName = 'TouchFriendlyButton';

// Mobile-optimized card with better touch areas
export function MobileCard({ 
  children, 
  className,
  onClick,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base styles
        'bg-card rounded-lg border border-border shadow-sm',
        // Touch-friendly padding
        'p-4 sm:p-6',
        // Interactive states
        onClick && [
          'cursor-pointer touch-manipulation',
          'hover:shadow-lg transition-all duration-200',
          'active:scale-[0.98] active:shadow-md'
        ],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// Responsive grid with mobile-first approach
export function ResponsiveGrid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}) {
  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-6',
        gridCols[cols.mobile || 1],
        cols.tablet && `md:${gridCols[cols.tablet]}`,
        cols.desktop && `lg:${gridCols[cols.desktop]}`,
        className
      )}
    >
      {children}
    </div>
  );
}

// Mobile-friendly spacing utilities
export const mobileSpacing = {
  gap: 'gap-3 sm:gap-4 md:gap-6',
  padding: 'p-4 sm:p-6 md:p-8',
  margin: 'mb-4 sm:mb-6 md:mb-8',
};