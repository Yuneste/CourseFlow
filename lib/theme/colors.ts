// CourseFlow Color System Configuration
// This file centralizes all color definitions for easy theming

export const colors = {
  // Brand Colors
  brand: {
    primary: '#4F46E5',        // Indigo - main brand color
    primaryDark: '#E85D9F',    // Pink - primary for dark mode
    accent: '#8B5CF6',         // Purple - secondary brand color
    accentDark: '#A78BFA',     // Light purple - accent for dark mode
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',        // Green - success states
    warning: '#F59E0B',        // Amber - warnings
    error: '#EF4444',          // Red - errors
    info: '#3B82F6',           // Blue - information
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#FAFAFA',
      100: '#F4F4F5',
      200: '#E4E4E7',
      300: '#D4D4D8',
      400: '#A1A1AA',
      500: '#71717A',
      600: '#52525B',
      700: '#3F3F46',
      800: '#27272A',
      900: '#18181B',
      950: '#0D0D0D',
    }
  },

  // Legacy Colors (to be removed)
  legacy: {
    salmon: '#FA8072',         // Old brand color - being phased out
    lightSalmon: '#FFF5F5',
    coral: '#FF6B6B',
    lightCoral: '#FFE4E1',
  }
} as const;

// Color aliases for easier usage
export const themeColors = {
  // Light mode
  light: {
    background: colors.neutral.white,
    foreground: colors.neutral.gray[900],
    card: colors.neutral.white,
    cardForeground: colors.neutral.gray[900],
    primary: colors.brand.primary,
    primaryForeground: colors.neutral.white,
    secondary: colors.neutral.gray[100],
    secondaryForeground: colors.neutral.gray[900],
    muted: colors.neutral.gray[100],
    mutedForeground: colors.neutral.gray[600],
    accent: colors.neutral.gray[200],
    accentForeground: colors.neutral.gray[900],
    destructive: colors.semantic.error,
    destructiveForeground: colors.neutral.white,
    border: colors.neutral.gray[200],
    input: colors.neutral.gray[200],
    ring: colors.brand.primary,
    success: colors.semantic.success,
    successForeground: colors.neutral.white,
    warning: colors.semantic.warning,
    warningForeground: colors.neutral.white,
  },

  // Dark mode
  dark: {
    background: colors.neutral.gray[950],
    foreground: colors.neutral.gray[50],
    card: colors.neutral.gray[900],
    cardForeground: colors.neutral.gray[50],
    primary: colors.brand.primaryDark,
    primaryForeground: colors.neutral.gray[900],
    secondary: colors.neutral.gray[800],
    secondaryForeground: colors.neutral.gray[50],
    muted: colors.neutral.gray[800],
    mutedForeground: colors.neutral.gray[400],
    accent: colors.neutral.gray[700],
    accentForeground: colors.neutral.gray[50],
    destructive: '#DC2626',
    destructiveForeground: colors.neutral.white,
    border: colors.neutral.gray[700],
    input: colors.neutral.gray[700],
    ring: colors.brand.primaryDark,
    success: colors.semantic.success,
    successForeground: colors.neutral.white,
    warning: colors.semantic.warning,
    warningForeground: colors.neutral.white,
  },

  // Academic theme (used in dashboard)
  academic: {
    light: {
      background: colors.neutral.gray[50],
      primary: colors.brand.primary,
      accent: colors.brand.accent,
    },
    dark: {
      background: '#1A202C',
      primary: '#6366F1',
      accent: colors.brand.accentDark,
    }
  }
} as const;

// Gradient definitions
export const gradients = {
  primary: `linear-gradient(to right, ${colors.brand.primary}, ${colors.brand.accent})`,
  subtle: `linear-gradient(135deg, ${colors.brand.primary}10, ${colors.brand.accent}10)`,
  academic: 'linear-gradient(to right, #4F46E5, #8B5CF6)',
  decorative: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(139, 92, 246, 0.05))',
} as const;

// Export type for TypeScript
export type ColorScheme = typeof colors;
export type ThemeColors = typeof themeColors;