'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link, { LinkProps } from 'next/link';
import { cn } from '@/lib/utils';

interface PrefetchLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  onHover?: boolean;
  onVisible?: boolean;
  delay?: number;
}

export function PrefetchLink({
  href,
  children,
  className,
  onHover = true,
  onVisible = false,
  delay = 200,
  ...props
}: PrefetchLinkProps) {
  const router = useRouter();
  let hoverTimeout: NodeJS.Timeout;

  const handleMouseEnter = () => {
    if (onHover) {
      hoverTimeout = setTimeout(() => {
        router.prefetch(href.toString());
      }, delay);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
  };

  useEffect(() => {
    if (onVisible) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            router.prefetch(href.toString());
            observer.disconnect();
          }
        },
        { rootMargin: '50px' }
      );

      const element = document.querySelector(`[href="${href}"]`);
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    }
  }, [href, onVisible, router]);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
}

// Hook for programmatic prefetching
export function usePrefetch() {
  const router = useRouter();

  const prefetch = (href: string) => {
    router.prefetch(href);
  };

  const prefetchMultiple = (hrefs: string[]) => {
    hrefs.forEach(href => router.prefetch(href));
  };

  const prefetchOnIdle = (href: string) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        router.prefetch(href);
      });
    } else {
      setTimeout(() => {
        router.prefetch(href);
      }, 1000);
    }
  };

  return { prefetch, prefetchMultiple, prefetchOnIdle };
}

// Component to prefetch routes based on user behavior
interface SmartPrefetchProps {
  routes: {
    path: string;
    probability?: number;
    condition?: () => boolean;
  }[];
  children: ReactNode;
}

export function SmartPrefetch({ routes, children }: SmartPrefetchProps) {
  const { prefetchOnIdle } = usePrefetch();

  useEffect(() => {
    // Prefetch high-probability routes on idle
    const highPriorityRoutes = routes
      .filter(route => {
        const shouldPrefetch = !route.condition || route.condition();
        const hasHighProbability = !route.probability || route.probability > 0.5;
        return shouldPrefetch && hasHighProbability;
      })
      .map(route => route.path);

    highPriorityRoutes.forEach(path => {
      prefetchOnIdle(path);
    });
  }, [routes, prefetchOnIdle]);

  return <>{children}</>;
}

// Resource prefetching utilities
export const ResourcePrefetch = {
  // Prefetch an image
  image: (src: string) => {
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = src;
    }
  },

  // Prefetch multiple images
  images: (srcs: string[]) => {
    srcs.forEach(src => ResourcePrefetch.image(src));
  },

  // Prefetch a script
  script: (src: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'script';
      link.href = src;
      document.head.appendChild(link);
    }
  },

  // Prefetch CSS
  style: (href: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    }
  },

  // Prefetch data from API
  data: async (url: string) => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open('api-cache');
        const response = await fetch(url);
        await cache.put(url, response);
      } catch (error) {
        console.error('Failed to prefetch data:', error);
      }
    }
  }
};