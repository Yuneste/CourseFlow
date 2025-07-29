import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: number | string
  as?: React.ElementType
}

export const ResponsiveGrid = forwardRef<
  HTMLDivElement,
  ResponsiveGridProps
>(({ className, cols = {}, gap = 4, as: Component = 'div', ...props }, ref) => {
  const {
    default: defaultCols = 1,
    sm = defaultCols,
    md = sm,
    lg = md,
    xl = lg,
    '2xl': xxl = xl
  } = cols

  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap

  return (
    <Component
      ref={ref}
      className={cn(
        'grid',
        gapClass,
        `grid-cols-${defaultCols}`,
        sm > defaultCols && `sm:grid-cols-${sm}`,
        md > sm && `md:grid-cols-${md}`,
        lg > md && `lg:grid-cols-${lg}`,
        xl > lg && `xl:grid-cols-${xl}`,
        xxl > xl && `2xl:grid-cols-${xxl}`,
        className
      )}
      {...props}
    />
  )
})

ResponsiveGrid.displayName = 'ResponsiveGrid'

// Pre-defined grid layouts for common use cases
export const FileGrid = forwardRef<
  HTMLDivElement,
  Omit<ResponsiveGridProps, 'cols'>
>(({ className, ...props }, ref) => (
  <ResponsiveGrid
    ref={ref}
    cols={{ default: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}
    gap={4}
    className={className}
    {...props}
  />
))

FileGrid.displayName = 'FileGrid'

export const CourseGrid = forwardRef<
  HTMLDivElement,
  Omit<ResponsiveGridProps, 'cols'>
>(({ className, ...props }, ref) => (
  <ResponsiveGrid
    ref={ref}
    cols={{ default: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
    gap={6}
    className={className}
    {...props}
  />
))

CourseGrid.displayName = 'CourseGrid'

export const DashboardGrid = forwardRef<
  HTMLDivElement,
  Omit<ResponsiveGridProps, 'cols'>
>(({ className, ...props }, ref) => (
  <ResponsiveGrid
    ref={ref}
    cols={{ default: 1, md: 2, lg: 3 }}
    gap={6}
    className={className}
    {...props}
  />
))

DashboardGrid.displayName = 'DashboardGrid'

// Masonry grid for dynamic content heights
interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: number | string
}

export const MasonryGrid = forwardRef<
  HTMLDivElement,
  MasonryGridProps
>(({ className, columns = {}, gap = 4, children, ...props }, ref) => {
  const {
    default: defaultCols = 1,
    sm = defaultCols,
    md = sm,
    lg = md,
    xl = lg,
    '2xl': xxl = xl
  } = columns

  return (
    <div
      ref={ref}
      className={cn(
        'columns-1',
        sm > 1 && `sm:columns-${sm}`,
        md > sm && `md:columns-${md}`,
        lg > md && `lg:columns-${lg}`,
        xl > lg && `xl:columns-${xl}`,
        xxl > xl && `2xl:columns-${xxl}`,
        `gap-${gap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

MasonryGrid.displayName = 'MasonryGrid'

// Auto-fit grid that automatically adjusts columns based on min width
interface AutoFitGridProps extends React.HTMLAttributes<HTMLDivElement> {
  minItemWidth?: number | string
  gap?: number | string
  as?: React.ElementType
}

export const AutoFitGrid = forwardRef<
  HTMLDivElement,
  AutoFitGridProps
>(({ className, minItemWidth = '250px', gap = 4, as: Component = 'div', ...props }, ref) => {
  const minWidth = typeof minItemWidth === 'number' ? `${minItemWidth}px` : minItemWidth
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap

  return (
    <Component
      ref={ref}
      className={cn('grid', gapClass, className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
        ...props.style
      }}
      {...props}
    />
  )
})

AutoFitGrid.displayName = 'AutoFitGrid'

// Responsive flex grid for more complex layouts
interface FlexGridProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column'
  wrap?: boolean
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  gap?: number | string
  responsive?: {
    sm?: Partial<Pick<FlexGridProps, 'direction' | 'wrap' | 'justify' | 'align'>>
    md?: Partial<Pick<FlexGridProps, 'direction' | 'wrap' | 'justify' | 'align'>>
    lg?: Partial<Pick<FlexGridProps, 'direction' | 'wrap' | 'justify' | 'align'>>
    xl?: Partial<Pick<FlexGridProps, 'direction' | 'wrap' | 'justify' | 'align'>>
  }
}

export const FlexGrid = forwardRef<
  HTMLDivElement,
  FlexGridProps
>(({ 
  className, 
  direction = 'row',
  wrap = true,
  justify = 'start',
  align = 'stretch',
  gap = 4,
  responsive = {},
  ...props 
}, ref) => {
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap
  
  const baseClasses = cn(
    'flex',
    direction === 'row' ? 'flex-row' : 'flex-col',
    wrap && 'flex-wrap',
    `justify-${justify}`,
    `items-${align}`,
    gapClass
  )

  const responsiveClasses = Object.entries(responsive).map(([breakpoint, values]) => {
    const classes = []
    if (values.direction) classes.push(`${breakpoint}:flex-${values.direction}`)
    if (values.justify) classes.push(`${breakpoint}:justify-${values.justify}`)
    if (values.align) classes.push(`${breakpoint}:items-${values.align}`)
    if (values.wrap !== undefined) classes.push(values.wrap ? `${breakpoint}:flex-wrap` : `${breakpoint}:flex-nowrap`)
    return classes.join(' ')
  }).join(' ')

  return (
    <div
      ref={ref}
      className={cn(baseClasses, responsiveClasses, className)}
      {...props}
    />
  )
})

FlexGrid.displayName = 'FlexGrid'