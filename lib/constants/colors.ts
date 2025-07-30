/**
 * CourseFlow Design System Colors
 * These colors should be used consistently throughout the application
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    teal: '#8CC2BE',
    tealHover: '#8CC2BE',
    tealLight: 'rgba(140, 194, 190, 0.1)',
    tealMedium: 'rgba(140, 194, 190, 0.2)',
    tealGlow: 'rgba(140, 194, 190, 0.8)',
  },
  
  // Text Hierarchy Colors
  text: {
    sectionHeader: '#49C993', // Main section titles (Overview, Quick Actions, etc.)
    cardTitle: '#FFC194',      // Card and component titles
    termStatus: '#FF7878',     // Current term and status indicators
  },
  
  // Semantic Colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

/**
 * Tailwind class names for consistent styling
 */
export const styleClasses = {
  // Cards
  card: {
    base: 'bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300',
    interactive: 'cursor-pointer hover:scale-[1.02] hover:-translate-y-1',
  },
  
  // Typography
  typography: {
    pageTitle: 'text-4xl font-bold',
    sectionHeader: 'text-base font-semibold',
    cardTitle: 'text-xs font-medium',
    termText: 'text-xs font-medium',
    body: 'text-sm text-muted-foreground',
  },
  
  // Animations
  animation: {
    fadeIn: 'opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]',
    slideUp: 'translate-y-5 animate-[slideUp_0.5s_ease-out_forwards]',
  },
  
  // Spacing
  spacing: {
    section: 'mb-6 md:mb-8',
    card: 'p-4 sm:p-6',
    grid: 'gap-3 sm:gap-4 md:gap-6',
  },
} as const;

/**
 * Helper function to apply CourseFlow color scheme
 */
export const getColorClass = (type: 'sectionHeader' | 'cardTitle' | 'termStatus') => {
  const colorMap = {
    sectionHeader: `text-[${colors.text.sectionHeader}]`,
    cardTitle: `text-[${colors.text.cardTitle}]`,
    termStatus: `text-[${colors.text.termStatus}]`,
  };
  
  return colorMap[type];
};