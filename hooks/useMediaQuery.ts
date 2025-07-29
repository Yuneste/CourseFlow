import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/lib/constants/ui.constants';

/**
 * Hook to detect screen size based on media queries
 * @param query - Media query string or breakpoint key
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string | keyof typeof BREAKPOINTS): boolean {
  // Convert breakpoint key to media query
  const mediaQuery = query in BREAKPOINTS 
    ? `(min-width: ${BREAKPOINTS[query as keyof typeof BREAKPOINTS]}px)`
    : query;

  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(mediaQuery);
    
    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    media.addEventListener('change', listener);

    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [mediaQuery]);

  return matches;
}