# Quick Color Change Guide

## How to Change CourseFlow Colors

### Simple Color Change Request Format

Just tell me what you want to change using this format:

```
"Change primary color to [color name or hex]"
"Make the app use [color theme] instead of purple"
"Use a [adjective] color scheme"
```

### Examples

1. **Change Primary Color**
   ```
   "Change primary color to emerald green"
   "Use #059669 as the primary color"
   ```

2. **Change Entire Color Scheme**
   ```
   "Make the app use a blue and teal color scheme"
   "Change to a warm orange and red theme"
   "Use a monochromatic gray theme"
   ```

3. **Specific Changes**
   ```
   "Make buttons green instead of purple"
   "Change success color to blue"
   "Make cards have a slight gray background"
   ```

### Current Color Map

| Element | Current Color | CSS Variable |
|---------|--------------|--------------|
| Primary (buttons, links) | Indigo #4F46E5 | `--primary` |
| Secondary (hover states) | Purple #8B5CF6 | `--accent` |
| Background | White #FFFFFF | `--background` |
| Text | Almost Black #171717 | `--foreground` |
| Cards | White #FFFFFF | `--card` |
| Borders | Light Gray #E5E7EB | `--border` |
| Success | Green #10B981 | `--success` |
| Error | Red #EF4444 | `--destructive` |
| Warning | Amber #F59E0B | `--warning` |

### What Happens When You Request a Color Change

I will:
1. Update `/tailwind.config.ts` with new color values
2. Update `/app/globals.css` CSS variables
3. Update `/lib/theme/colors.ts` color definitions
4. Find and update any hardcoded colors in components
5. Ensure proper contrast ratios for accessibility
6. Test both light and dark modes

### Popular Color Schemes

**Professional Blue**
- Primary: #2563EB (Blue)
- Accent: #0EA5E9 (Sky)
- Success: #14B8A6 (Teal)

**Modern Green**
- Primary: #059669 (Emerald)
- Accent: #10B981 (Green)
- Success: #84CC16 (Lime)

**Warm Orange**
- Primary: #EA580C (Orange)
- Accent: #DC2626 (Red)
- Success: #CA8A04 (Yellow)

**Minimalist Gray**
- Primary: #374151 (Gray)
- Accent: #6B7280 (Gray)
- Success: #059669 (Emerald)

**Purple Gradient**
- Primary: #7C3AED (Violet)
- Accent: #A855F7 (Purple)
- Success: #8B5CF6 (Purple)

### Notes

- All color changes maintain WCAG AA accessibility standards
- Dark mode colors are automatically adjusted for readability
- Focus indicators and hover states are preserved
- Semantic colors (error, success) remain recognizable