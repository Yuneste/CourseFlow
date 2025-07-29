'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { User } from '@/types';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  user?: User | null;
  showSidebar?: boolean;
  onSignOut?: () => void;
  className?: string;
}

export function ResponsiveLayout({
  children,
  user,
  showSidebar = true,
  onSignOut = () => {},
  className
}: ResponsiveLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      setIsSidebarCollapsed(collapsed);
    };

    // Initial check
    handleStorageChange();

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const sidebarWidth = isSidebarCollapsed ? 80 : 280;

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {showSidebar && user && (
        <Sidebar user={user} onSignOut={onSignOut} />
      )}
      
      <main 
        className={cn(
          "transition-all duration-300 ease-in-out",
          showSidebar && "lg:ml-[var(--sidebar-width)]"
        )}
        style={{
          '--sidebar-width': `${sidebarWidth}px`
        } as React.CSSProperties}
      >
        {children}
      </main>
    </div>
  );
}

// Responsive container component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full'
};

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl'
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 4
}: ResponsiveGridProps) {
  const gridClasses = cn(
    "grid",
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    `gap-${gap}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

// Hook to detect screen size
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Breakpoint hooks
export function useBreakpoint() {
  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isXl = useMediaQuery('(min-width: 1280px)');
  const is2xl = useMediaQuery('(min-width: 1536px)');

  return {
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl
  };
}