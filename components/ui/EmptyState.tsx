import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /**
   * Icon to display
   */
  icon: LucideIcon;
  /**
   * Main title text
   */
  title: string;
  /**
   * Descriptive text
   */
  description?: string;
  /**
   * Action button configuration
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Reusable empty state component for consistent UX
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = 'md',
  className
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-16',
      icon: 'h-20 w-20',
      title: 'text-2xl',
      description: 'text-lg'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizes.container,
      className
    )}>
      <div className="p-3 bg-muted rounded-full mb-4">
        <Icon className={cn('text-muted-foreground', sizes.icon)} />
      </div>
      
      <h3 className={cn('font-semibold text-foreground mb-2', sizes.title)}>
        {title}
      </h3>
      
      {description && (
        <p className={cn('text-muted-foreground max-w-sm mb-6', sizes.description)}>
          {description}
        </p>
      )}
      
      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
          className="min-w-[120px]"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}