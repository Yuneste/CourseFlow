/**
 * UI Constants for CourseFlow
 * Centralized configuration for consistent UI/UX across the application
 */

// Animation durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Spacing scale (based on 4px grid system)
export const SPACING = {
  NONE: 0,
  XS: 4,    // 0.25rem
  SM: 8,    // 0.5rem
  MD: 16,   // 1rem
  LG: 24,   // 1.5rem
  XL: 32,   // 2rem
  XXL: 48,  // 3rem
  XXXL: 64, // 4rem
} as const;

// Z-index scale for proper layering
export const Z_INDEX = {
  DROPDOWN: 50,
  STICKY: 100,
  MODAL_BACKDROP: 200,
  MODAL: 300,
  POPOVER: 400,
  TOOLTIP: 500,
  NOTIFICATION: 600,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

// Common transition configurations
export const TRANSITIONS = {
  DEFAULT: 'all 0.3s ease',
  FAST: 'all 0.15s ease',
  SLOW: 'all 0.5s ease',
  COLOR: 'color 0.3s ease, background-color 0.3s ease',
  TRANSFORM: 'transform 0.3s ease',
  OPACITY: 'opacity 0.3s ease',
} as const;

// Border radius scale
export const RADIUS = {
  NONE: '0',
  SM: '0.25rem',
  DEFAULT: '0.5rem',
  MD: '0.75rem',
  LG: '1rem',
  XL: '1.5rem',
  FULL: '9999px',
} as const;

// Shadow scale
export const SHADOWS = {
  NONE: 'none',
  SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// Common component sizes
export const SIZES = {
  ICON: {
    XS: 12,
    SM: 16,
    MD: 20,
    LG: 24,
    XL: 32,
  },
  AVATAR: {
    SM: 32,
    MD: 40,
    LG: 48,
    XL: 64,
  },
  BUTTON: {
    SM: 32,
    MD: 40,
    LG: 48,
  },
} as const;

// File size limits (in bytes)
export const FILE_LIMITS = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  DOCUMENT_MAX_SIZE: 25 * 1024 * 1024, // 25MB
} as const;

// Debounce delays (in milliseconds)
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 150,
} as const;

// Toast/Notification durations (in milliseconds)
export const TOAST_DURATION = {
  SHORT: 3000,
  NORMAL: 5000,
  LONG: 10000,
  PERSISTENT: Infinity,
} as const;