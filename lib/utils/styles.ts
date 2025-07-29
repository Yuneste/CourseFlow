import { cn } from '@/lib/utils';

/**
 * Style utilities for consistent styling across the application
 * Replaces inline styles with reusable utility functions
 */

// Animation classes
export const animations = {
  fadeIn: 'animate-in fade-in duration-500',
  slideIn: 'animate-in slide-in-from-bottom duration-300',
  slideInLeft: 'animate-in slide-in-from-left duration-300',
  slideInRight: 'animate-in slide-in-from-right duration-500',
  scaleIn: 'animate-in zoom-in-95 duration-300',
  fadeOut: 'animate-out fade-out duration-300',
} as const;

// Transition classes
export const transitions = {
  all: 'transition-all duration-300',
  colors: 'transition-colors duration-200',
  transform: 'transition-transform duration-200',
  opacity: 'transition-opacity duration-300',
} as const;

// Hover effects
export const hover = {
  scale: 'hover:scale-105',
  scaleSmall: 'hover:scale-102',
  lift: 'hover:shadow-lg hover:-translate-y-1',
  glow: 'hover:shadow-xl hover:shadow-primary/20',
  brighten: 'hover:brightness-110',
} as const;

// Card styles
export const cardStyles = {
  base: cn(
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    transitions.all
  ),
  interactive: cn(
    'rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer',
    transitions.all,
    hover.lift
  ),
  gradient: cn(
    'rounded-lg border bg-gradient-to-br from-card to-card/80',
    'backdrop-blur-sm shadow-sm',
    transitions.all
  ),
} as const;

// Button variants
export const buttonStyles = {
  primary: cn(
    'bg-primary hover:bg-primary/90 text-primary-foreground',
    transitions.colors
  ),
  secondary: cn(
    'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
    transitions.colors
  ),
  ghost: cn(
    'hover:bg-accent hover:text-accent-foreground',
    transitions.colors
  ),
  danger: cn(
    'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    transitions.colors
  ),
} as const;

// Layout utilities
export const layout = {
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12 lg:py-16',
  stack: 'flex flex-col space-y-4',
  row: 'flex flex-row items-center gap-4',
  grid: 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
} as const;

// Typography styles
export const typography = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  body: 'text-base leading-relaxed',
  small: 'text-sm text-muted-foreground',
  tiny: 'text-xs text-muted-foreground',
} as const;

// State styles
export const states = {
  loading: 'animate-pulse bg-muted',
  disabled: 'opacity-50 cursor-not-allowed',
  error: 'border-destructive text-destructive',
  success: 'border-green-500 text-green-700',
  warning: 'border-yellow-500 text-yellow-700',
} as const;

// Utility functions
export const getAnimationDelay = (index: number, baseDelay = 0.1): string => {
  return `animation-delay: ${index * baseDelay}s`;
};

export const getGridColumns = (count: number): string => {
  if (count <= 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count <= 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
};

export const getResponsivePadding = (size: 'sm' | 'md' | 'lg' = 'md'): string => {
  const paddingMap = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8 lg:p-10',
  };
  return paddingMap[size];
};