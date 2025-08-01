/**
 * CourseFlow Light Theme Design System
 * A modern, vibrant light theme inspired by the landing page colors
 */

export const lightTheme = {
  // Color Palette - Modern professional colors
  colors: {
    // Backgrounds
    background: {
      main: '#FAFBFC',        // Very light gray-blue
      card: '#FFFFFF',        // Pure white for cards
      hover: '#F8FAFB',       // Subtle hover state
      muted: '#F3F4F6',       // Muted sections
      accent: '#EFF6FF',      // Light blue accent areas
    },
    
    // Primary Brand Colors - Professional blue/purple palette
    primary: {
      main: '#6366F1',          // Modern indigo
      light: '#E0E7FF',         // Very light indigo for backgrounds
      muted: '#C7D2FE',         // Muted indigo for subtle elements
      dark: '#4F46E5',          // Darker indigo for text on light
    },
    
    // Accent Colors - Sophisticated palette
    accent: {
      purple: '#8B5CF6',        // Soft purple for headers
      purpleLight: '#EDE9FE',   // Light purple backgrounds
      blue: '#3B82F6',          // Professional blue
      blueLight: '#DBEAFE',     // Light blue backgrounds
      slate: '#64748B',         // Neutral slate for status
      slateLight: '#F1F5F9',    // Light slate backgrounds
    },
    
    // Text Colors
    text: {
      primary: '#1F2937',       // Dark gray for main text
      secondary: '#6B7280',     // Medium gray for secondary
      muted: '#9CA3AF',         // Light gray for muted
      accent: '#8CC2BE',        // Teal for links/actions
    },
    
    // Border Colors
    border: {
      default: '#E5E7EB',       // Light gray border
      hover: '#D1D5DB',         // Darker on hover
      focus: '#8CC2BE',         // Teal on focus
      muted: '#F3F4F6',         // Very light border
    },
    
    // Semantic Colors
    semantic: {
      success: '#10B981',
      successLight: '#D1FAE5',
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      error: '#EF4444',
      errorLight: '#FEE2E2',
      info: '#3B82F6',
      infoLight: '#DBEAFE',
    },
  },
  
  // Shadows for depth
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    colored: '0 10px 25px -5px rgba(140, 194, 190, 0.25)',
  },
  
  // Border Radius
  radius: {
    sm: '0.375rem',
    base: '0.5rem',
    md: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    slower: '500ms ease-out',
  },
};

// Tailwind utility classes for the light theme
export const lightThemeClasses = {
  // Page layouts
  page: {
    wrapper: 'min-h-screen bg-[#FAFBFC]',
    container: 'container mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-8 sm:py-12',
  },
  
  // Cards
  card: {
    base: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
    interactive: 'cursor-pointer hover:scale-[1.01] hover:border-[#8CC2BE]/30',
    colored: 'bg-gradient-to-br from-white to-[#E6F7F5] border-[#D1EAE7]',
  },
  
  // Buttons
  button: {
    primary: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-[#F8FAFB] border border-gray-200 hover:border-[#6366F1]/30 text-gray-700',
    ghost: 'hover:bg-[#E0E7FF] text-gray-600 hover:text-[#4F46E5]',
  },
  
  // Typography
  text: {
    heading: 'text-gray-900 font-bold',
    subheading: 'text-[#49C993] font-semibold',
    body: 'text-gray-600',
    muted: 'text-gray-500',
    accent: 'text-[#8CC2BE]',
  },
  
  // Forms
  input: {
    base: 'bg-white border border-gray-300 focus:border-[#8CC2BE] focus:ring-2 focus:ring-[#8CC2BE]/20',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
  },
  
  // Badges
  badge: {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    primary: 'bg-[#E6F7F5] text-[#5A9B95] border border-[#D1EAE7]',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
  },
};

// Component-specific styles
export const componentStyles = {
  sidebar: {
    base: 'bg-white border-r border-gray-200',
    item: 'hover:bg-[#E0E7FF] text-gray-700 hover:text-[#4F46E5]',
    active: 'bg-[#E0E7FF] text-[#4F46E5] font-medium',
  },
  
  header: {
    base: 'bg-white border-b border-gray-200 backdrop-blur-sm bg-white/95',
    nav: 'text-gray-600 hover:text-[#6366F1]',
  },
  
  statsCard: {
    base: 'bg-white border border-gray-200 hover:border-[#6366F1]/30',
    icon: 'bg-[#E0E7FF] text-[#6366F1]',
    title: 'text-[#8B5CF6] text-xs font-medium',
    value: 'text-gray-900 font-bold',
  },
  
  featureCard: {
    base: 'bg-gradient-to-br from-white to-[#FAFBFC] border border-gray-200 hover:border-[#6366F1]/30',
    icon: 'text-[#6366F1]',
    title: 'text-gray-900 font-semibold',
    description: 'text-gray-600',
  },
};