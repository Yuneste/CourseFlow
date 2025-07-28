'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { ComponentProps, MouseEvent, useCallback } from 'react';

interface PrefetchLinkProps extends ComponentProps<typeof NextLink> {
  prefetch?: boolean;
  prefetchOnHover?: boolean;
}

export function Link({ 
  prefetch = true, 
  prefetchOnHover = true,
  children,
  href,
  ...props 
}: PrefetchLinkProps) {
  const router = useRouter();

  const handleMouseEnter = useCallback(() => {
    if (prefetchOnHover && typeof href === 'string') {
      router.prefetch(href);
    }
  }, [href, prefetchOnHover, router]);

  return (
    <NextLink 
      href={href} 
      prefetch={prefetch}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </NextLink>
  );
}