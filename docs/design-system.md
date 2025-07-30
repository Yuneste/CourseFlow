# CourseFlow Design System

## Color Palette

### Primary Colors
- **Primary Teal**: `#8CC2BE` - Used for primary actions, buttons, and accents
- **Section Headers (Green)**: `#49C993` - Used for main section titles (Overview, Quick Actions, My Courses)
- **Card Titles (Peach)**: `#FFC194` - Used for card/component titles within sections
- **Term/Status (Coral)**: `#FF7878` - Used for current term text and important status indicators

### Semantic Colors
- **Success**: `#10B981` (green-500)
- **Warning**: `#F59E0B` (amber-500)
- **Error**: `#EF4444` (red-500)
- **Info**: `#3B82F6` (blue-500)

### Neutral Colors
- **Background**: Light theme base
- **Foreground**: Very dark text for contrast
- **Muted**: Gray tones for secondary text
- **Border**: Subtle borders between elements

## Typography Hierarchy

### Page Titles
- Size: `text-4xl` (2.25rem)
- Weight: `font-bold`
- Color: `#49C993`
- Example: "My Courses", "Dashboard"

### Section Headers
- Size: `text-base` to `text-lg`
- Weight: `font-semibold`
- Color: `#49C993`
- Example: "Overview", "Quick Actions"

### Card/Component Titles
- Size: `text-xs` to `text-base`
- Weight: `font-medium` to `font-semibold`
- Color: `#FFC194`
- Example: "Active Courses", "Files Uploaded", Individual course names

### Status/Term Text
- Size: `text-xs` to `text-sm`
- Weight: `font-medium`
- Color: `#FF7878`
- Example: "Sommersemester 2025", "Fall 2024"

### Body Text
- Size: `text-sm` to `text-base`
- Weight: `font-normal`
- Color: `text-foreground` or `text-muted-foreground`

## Component Patterns

### Cards
```tsx
<Card className="p-4 bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
  {/* Card content */}
</Card>
```

### Hover Effects
- Cards: `hover:shadow-xl` with `transition-all duration-300`
- Buttons: `hover:bg-[#8CC2BE]/90` or appropriate color variant
- Text links: `hover:text-primary` with `transition-colors`

### Shadows
- Default card shadow: `shadow-lg`
- Hover shadow: `shadow-xl`
- Special emphasis (benefits): `shadow-[0_0_50px_rgba(140,194,190,0.8)]`

### Spacing
- Section spacing: `mb-6` to `mb-8`
- Card padding: `p-4` (mobile) to `p-6` (desktop)
- Grid gaps: `gap-3` to `gap-6`

## Animation Patterns

### Framer Motion Defaults
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
```

### Hover Animations
```tsx
whileHover={{ scale: 1.02, y: -2 }}
whileTap={{ scale: 0.98 }}
```

## Usage Examples

### Section with Title
```tsx
<section>
  <h2 className="text-base font-semibold text-[#49C993] mb-3">Section Title</h2>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {/* Content */}
  </div>
</section>
```

### Stats Card
```tsx
<Card className="p-4 bg-card border-border shadow-lg hover:shadow-xl">
  <p className="text-xs text-[#FFC194] font-medium">Card Title</p>
  <h3 className="text-xl font-bold text-foreground">Value</h3>
  <span className="text-xs text-[#FF7878]">Current Term</span>
</Card>
```

### Feature Card
```tsx
<Card className="group hover:scale-102 transition-all">
  <h3 className="text-base font-semibold text-[#FFC194] group-hover:text-primary">
    Feature Name
  </h3>
  <p className="text-muted-foreground text-sm">Description</p>
</Card>
```

## Responsive Design

### Breakpoints
- Mobile: Default
- Tablet: `sm:` (640px)
- Desktop: `md:` (768px), `lg:` (1024px)

### Common Responsive Patterns
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Text: `text-sm sm:text-base md:text-lg`
- Spacing: `p-4 sm:p-6 md:p-8`

## Future Implementation Guidelines

1. **Always use the defined color variables** - Don't introduce new colors without updating this guide
2. **Follow the typography hierarchy** - Maintain consistency in text sizes and weights
3. **Use the established animation patterns** - Keep animations smooth and consistent
4. **Apply hover effects consistently** - All interactive elements should have clear feedback
5. **Maintain spacing consistency** - Use the defined spacing scale
6. **Test responsive behavior** - Ensure all new components work well on mobile

## Component Library Extensions

When creating new components:
1. Check if a similar pattern exists in this guide
2. Use the established color palette
3. Follow the animation and transition patterns
4. Ensure accessibility with proper contrast ratios
5. Document any new patterns in this guide