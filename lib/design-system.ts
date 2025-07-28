// CourseFlow Design System
// Based on the beautiful landing page design

export const colors = {
  // Primary colors - Salmon/Coral palette
  primary: {
    50: '#FFF5F5',
    100: '#FFE4E1',
    200: '#FFDAB9',
    300: '#FFB6B0',
    400: '#FFA07A',
    500: '#FA8072', // Main brand color
    600: '#FF6B6B',
    700: '#FF5252',
    800: '#F44336',
    900: '#D32F2F',
  },
  
  // Neutral colors with better contrast
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FFF8F5', // Warm off-white
    tertiary: '#FFF5F5', // Light salmon tint
    gradient: 'from-[#FFF5F5] via-white to-[#FFF8F5]',
  },
  
  // Text colors with proper contrast
  text: {
    primary: '#212121', // Dark gray for main text
    secondary: '#616161', // Medium gray for secondary text
    muted: '#9E9E9E', // Light gray for muted text
    inverse: '#FFFFFF', // White text on dark backgrounds
  },
  
  // Semantic colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
  },
  
  // Font sizes with line heights
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
};

// Component styles
export const components = {
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
    variants: {
      primary: 'bg-[#FA8072] text-white hover:bg-[#FF6B6B] focus:ring-[#FA8072] shadow-md hover:shadow-lg transform hover:scale-105',
      secondary: 'bg-white text-[#FA8072] border-2 border-[#FA8072] hover:bg-[#FFF5F5] focus:ring-[#FA8072]',
      ghost: 'text-gray-600 hover:text-[#FA8072] hover:bg-[#FFF5F5]',
    },
  },
  
  card: {
    base: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200',
    hover: 'hover:scale-[1.02] hover:-translate-y-1',
  },
  
  input: {
    base: 'w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#FA8072] focus:ring-2 focus:ring-[#FA8072]/20 transition-all duration-200',
  },
};

// Animation presets
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
};

// Gradient presets
export const gradients = {
  primary: 'bg-gradient-to-r from-[#FA8072] to-[#FF6B6B]',
  secondary: 'bg-gradient-to-br from-[#FFF5F5] via-white to-[#FFF8F5]',
  text: 'bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] bg-clip-text text-transparent',
  card: 'bg-gradient-to-br from-white to-[#FFF5F5]',
};