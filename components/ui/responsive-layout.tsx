import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

// Two-column layout that stacks on mobile
interface TwoColumnLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  leftColumn: React.ReactNode
  rightColumn: React.ReactNode
  leftColumnClassName?: string
  rightColumnClassName?: string
  stackOn?: 'sm' | 'md' | 'lg'
  gap?: number | string
  ratio?: '1:1' | '1:2' | '2:1' | '1:3' | '3:1'
}

export const TwoColumnLayout = forwardRef<
  HTMLDivElement,
  TwoColumnLayoutProps
>(({ 
  className,
  leftColumn,
  rightColumn,
  leftColumnClassName,
  rightColumnClassName,
  stackOn = 'md',
  gap = 6,
  ratio = '1:1',
  ...props 
}, ref) => {
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap
  
  const ratioClasses = {
    '1:1': 'grid-cols-1 md:grid-cols-2',
    '1:2': 'grid-cols-1 md:grid-cols-3',
    '2:1': 'grid-cols-1 md:grid-cols-3',
    '1:3': 'grid-cols-1 md:grid-cols-4',
    '3:1': 'grid-cols-1 md:grid-cols-4',
  }

  const leftRatioClasses = {
    '1:1': '',
    '1:2': 'md:col-span-1',
    '2:1': 'md:col-span-2',
    '1:3': 'md:col-span-1',
    '3:1': 'md:col-span-3',
  }

  const rightRatioClasses = {
    '1:1': '',
    '1:2': 'md:col-span-2',
    '2:1': 'md:col-span-1',
    '1:3': 'md:col-span-3',
    '3:1': 'md:col-span-1',
  }

  const stackClasses = {
    sm: ratioClasses[ratio].replace('md:', 'sm:'),
    md: ratioClasses[ratio],
    lg: ratioClasses[ratio].replace('md:', 'lg:'),
  }

  return (
    <div
      ref={ref}
      className={cn('grid', gapClass, stackClasses[stackOn], className)}
      {...props}
    >
      <div className={cn(leftRatioClasses[ratio], leftColumnClassName)}>
        {leftColumn}
      </div>
      <div className={cn(rightRatioClasses[ratio], rightColumnClassName)}>
        {rightColumn}
      </div>
    </div>
  )
})

TwoColumnLayout.displayName = 'TwoColumnLayout'

// Sidebar layout for dashboard-style pages
interface SidebarLayoutProps {
  sidebar: React.ReactNode
  content: React.ReactNode
  sidebarClassName?: string
  contentClassName?: string
  sidebarPosition?: 'left' | 'right'
  sidebarWidth?: 'narrow' | 'default' | 'wide'
  collapsible?: boolean
  defaultCollapsed?: boolean
  className?: string
}

export const SidebarLayout = forwardRef<
  HTMLDivElement,
  SidebarLayoutProps
>(({ 
  className,
  sidebar,
  content,
  sidebarClassName,
  contentClassName,
  sidebarPosition = 'left',
  sidebarWidth = 'default',
  collapsible = false,
  defaultCollapsed = false,
}, ref) => {
  const widthClasses = {
    narrow: 'w-48',
    default: 'w-64',
    wide: 'w-80',
  }

  return (
    <div
      ref={ref}
      className={cn('flex min-h-screen', className)}
    >
      {sidebarPosition === 'left' && (
        <>
          <aside className={cn(
            'hidden lg:block',
            widthClasses[sidebarWidth],
            'border-r bg-card',
            sidebarClassName
          )}>
            {sidebar}
          </aside>
          <main className={cn('flex-1', contentClassName)}>
            {content}
          </main>
        </>
      )}
      {sidebarPosition === 'right' && (
        <>
          <main className={cn('flex-1', contentClassName)}>
            {content}
          </main>
          <aside className={cn(
            'hidden lg:block',
            widthClasses[sidebarWidth],
            'border-l bg-card',
            sidebarClassName
          )}>
            {sidebar}
          </aside>
        </>
      )}
    </div>
  )
})

SidebarLayout.displayName = 'SidebarLayout'

// Holy grail layout (header, footer, sidebar, content)
interface HolyGrailLayoutProps {
  header: React.ReactNode
  footer: React.ReactNode
  sidebar?: React.ReactNode
  content: React.ReactNode
  className?: string
  headerClassName?: string
  footerClassName?: string
  sidebarClassName?: string
  contentClassName?: string
}

export function HolyGrailLayout({
  header,
  footer,
  sidebar,
  content,
  className,
  headerClassName,
  footerClassName,
  sidebarClassName,
  contentClassName,
}: HolyGrailLayoutProps) {
  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <header className={cn('border-b', headerClassName)}>
        {header}
      </header>
      <div className="flex flex-1">
        {sidebar && (
          <aside className={cn(
            'hidden w-64 border-r bg-card lg:block',
            sidebarClassName
          )}>
            {sidebar}
          </aside>
        )}
        <main className={cn('flex-1', contentClassName)}>
          {content}
        </main>
      </div>
      <footer className={cn('border-t', footerClassName)}>
        {footer}
      </footer>
    </div>
  )
}

// Split screen layout for comparisons
interface SplitScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  left: React.ReactNode
  right: React.ReactNode
  leftClassName?: string
  rightClassName?: string
  divider?: boolean
  resizable?: boolean
}

export const SplitScreen = forwardRef<
  HTMLDivElement,
  SplitScreenProps
>(({ 
  className,
  left,
  right,
  leftClassName,
  rightClassName,
  divider = true,
  resizable = false,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex h-full', className)}
      {...props}
    >
      <div className={cn('flex-1 overflow-auto', leftClassName)}>
        {left}
      </div>
      {divider && (
        <div className={cn(
          'w-px bg-border',
          resizable && 'cursor-col-resize hover:w-1 hover:bg-primary/50'
        )} />
      )}
      <div className={cn('flex-1 overflow-auto', rightClassName)}>
        {right}
      </div>
    </div>
  )
})

SplitScreen.displayName = 'SplitScreen'

// Responsive card grid with auto-sizing
interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  minCardWidth?: number
  gap?: number | string
  as?: React.ElementType
}

export const CardGrid = forwardRef<
  HTMLDivElement,
  CardGridProps
>(({ 
  className,
  minCardWidth = 300,
  gap = 4,
  as: Component = 'div',
  ...props 
}, ref) => {
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap

  return (
    <Component
      ref={ref}
      className={cn('grid', gapClass, className)}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
        ...props.style
      }}
      {...props}
    />
  )
})

CardGrid.displayName = 'CardGrid'