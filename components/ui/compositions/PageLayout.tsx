import React from 'react';
import { cn } from '@/lib/utils';
import { UnifiedBackground, UnifiedSection } from '@/components/ui/unified-background';
import { SPACING } from '@/lib/constants/ui.constants';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * Clean page layout composition
 * Example usage:
 * <PageLayout>
 *   <PageLayout.Header title="My Page" subtitle="Description" />
 *   <PageLayout.Content>
 *     Your content here
 *   </PageLayout.Content>
 * </PageLayout>
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <UnifiedBackground className={className}>
      {children}
    </UnifiedBackground>
  );
}

PageLayout.Header = function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  className 
}: PageHeaderProps) {
  return (
    <UnifiedSection className={cn('pb-0', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </UnifiedSection>
  );
};

PageLayout.Content = function PageContent({ 
  children, 
  className,
  maxWidth = 'full' 
}: PageContentProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'w-full'
  };

  return (
    <UnifiedSection className={cn(
      maxWidthClasses[maxWidth],
      'mx-auto',
      className
    )}>
      {children}
    </UnifiedSection>
  );
};