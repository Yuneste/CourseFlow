// Responsive breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Touch target size for mobile (44x44px minimum)
export const TOUCH_TARGET_SIZE = 44;

// Responsive spacing scale
export const spacing = {
  mobile: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
  },
  desktop: {
    xs: '0.75rem',  // 12px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
  }
} as const;

// Responsive font sizes
export const fontSize = {
  mobile: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  desktop: {
    xs: '0.875rem',   // 14px
    sm: '1rem',       // 16px
    base: '1.125rem', // 18px
    lg: '1.25rem',    // 20px
    xl: '1.5rem',     // 24px
    '2xl': '1.875rem',// 30px
    '3xl': '2.25rem', // 36px
    '4xl': '3rem',    // 48px
  }
} as const;

// Container max widths
export const containerMaxWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Grid column configurations
export const gridConfigs = {
  cards: {
    sm: 'grid-cols-1',
    md: 'sm:grid-cols-2',
    lg: 'lg:grid-cols-3',
    xl: 'xl:grid-cols-4',
  },
  forms: {
    sm: 'grid-cols-1',
    md: 'sm:grid-cols-2',
    lg: 'lg:grid-cols-2',
  },
  dashboard: {
    sm: 'grid-cols-1',
    md: 'md:grid-cols-2',
    lg: 'lg:grid-cols-3',
    xl: 'xl:grid-cols-4',
  }
} as const;

// Common responsive class combinations
export const responsiveClasses = {
  // Padding
  padding: {
    section: 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12',
    card: 'p-4 sm:p-6',
    button: 'px-4 py-2 sm:px-6 sm:py-3',
    input: 'px-3 py-2 sm:px-4 sm:py-2.5',
  },
  // Text
  text: {
    h1: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl',
    h2: 'text-xl sm:text-2xl lg:text-3xl',
    h3: 'text-lg sm:text-xl lg:text-2xl',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm',
  },
  // Spacing
  gap: {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6',
  },
  // Layouts
  stack: {
    sm: 'space-y-2 sm:space-y-3',
    md: 'space-y-3 sm:space-y-4',
    lg: 'space-y-4 sm:space-y-6',
  }
} as const;

// Helper function to check if device has touch
export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Helper function to get current breakpoint
export function getCurrentBreakpoint(): keyof typeof breakpoints | null {
  if (typeof window === 'undefined') return null;
  
  const width = window.innerWidth;
  
  if (width < breakpoints.sm) return null;
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  if (width < breakpoints['2xl']) return 'xl';
  return '2xl';
}

// Helper function to check if screen is mobile
export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.md;
}

// Helper function to check if screen is tablet
export function isTablet() {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= breakpoints.md && width < breakpoints.lg;
}

// Helper function to check if screen is desktop
export function isDesktop() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.lg;
}