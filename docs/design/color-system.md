# CourseFlow Color System

## Overview
This document defines the complete color system used throughout CourseFlow. To change colors, simply provide the new values for any of these tokens.

## Core Color Tokens

### Primary Colors
- **primary**: `#4F46E5` (Indigo) - Main brand color used for buttons, links, active states
- **primary-foreground**: `#FFFFFF` - Text color on primary backgrounds

### Neutral Colors
- **background**: `#FFFFFF` - Main page background
- **foreground**: `#171717` - Main text color
- **muted**: `#F0F2F4` - Subtle backgrounds
- **muted-foreground**: `#404040` - Secondary text
- **card**: `#FFFFFF` - Card backgrounds
- **card-foreground**: `#171717` - Text on cards
- **border**: `#E5E7EB` - All borders

### Semantic Colors
- **destructive**: `#EF4444` - Errors, delete actions
- **destructive-foreground**: `#FAFAFA` - Text on destructive
- **success**: `#10B981` - Success states
- **success-foreground**: `#FFFFFF` - Text on success
- **warning**: `#F59E0B` - Warning states
- **warning-foreground**: `#FFFFFF` - Text on warning

### Component-Specific Colors
- **accent**: `#DFE3E8` - Hover states, secondary actions
- **accent-foreground**: `#171717` - Text on accent
- **ring**: `#4F46E5` - Focus rings (matches primary)
- **input**: `#E5E7EB` - Input borders

## Color Usage Patterns

### Buttons
- **Primary Button**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **Secondary Button**: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- **Outline Button**: `border-border hover:bg-accent hover:text-accent-foreground`
- **Destructive Button**: `bg-destructive text-destructive-foreground hover:bg-destructive/90`

### Interactive Elements
- **Links**: `text-primary hover:text-primary/80`
- **Focus States**: `ring-2 ring-primary ring-offset-2`
- **Hover Cards**: `hover:shadow-lg hover:border-primary/20`
- **Selected Items**: `bg-primary/10 border-primary`

### Backgrounds
- **Page Background**: `bg-background`
- **Card Background**: `bg-card`
- **Subtle Background**: `bg-muted`
- **Hover Background**: `bg-accent`
- **Overlay Background**: `bg-background/80 backdrop-blur`

### Text
- **Primary Text**: `text-foreground`
- **Secondary Text**: `text-muted-foreground`
- **Link Text**: `text-primary`
- **Error Text**: `text-destructive`
- **Success Text**: `text-success`

### Gradients
- **Primary Gradient**: `from-primary to-primary/80`
- **Decorative Gradient**: `from-primary/5 to-accent/5`
- **Academic Theme Gradient**: `from-indigo-600 to-purple-600`

## Dark Mode Overrides

### Primary Colors (Dark)
- **primary**: `#E85D9F` (Brighter pink)
- **primary-foreground**: `#171717`

### Neutral Colors (Dark)
- **background**: `#0D0D0D`
- **foreground**: `#F2F2F2`
- **muted**: `#1F1F1F`
- **muted-foreground**: `#B3B3B3`
- **card**: `#171717`
- **card-foreground**: `#F2F2F2`
- **border**: `#334155`

## Academic Theme (Dashboard)

### Light Mode
- **background**: `#FAFAFA` (Soft gray)
- **primary**: `#4F46E5` (Indigo)
- **accent**: `#8B5CF6` (Purple)

### Dark Mode
- **background**: `#1A202C` (Dark blue-gray)
- **primary**: `#6366F1` (Bright indigo)
- **accent**: `#A78BFA` (Light purple)

## Quick Change Example

To change all colors at once, provide a prompt like:
```
Change the primary color from indigo (#4F46E5) to emerald (#10B981)
Change the accent from purple to teal
Keep neutrals the same but make cards slightly gray
```

## Files Containing Colors

### Configuration Files
- `/tailwind.config.ts` - Tailwind color definitions
- `/app/globals.css` - CSS variables and theme definitions

### Component Files Using Direct Colors
- `/app/dashboard/dashboard-client-redesigned.tsx` - Dashboard theme
- `/app/courses/courses-client.tsx` - Course cards
- `/app/onboarding/page.tsx` - Onboarding flow
- `/components/layout/Sidebar.tsx` - Navigation
- All files in `/components/ui/` - Base components

## Color Dependencies

When changing colors, ensure:
1. Contrast ratios meet WCAG AA (4.5:1 for normal text)
2. Focus indicators remain visible
3. Hover states are distinguishable
4. Dark mode maintains readability
5. Semantic colors (error, success) remain recognizable