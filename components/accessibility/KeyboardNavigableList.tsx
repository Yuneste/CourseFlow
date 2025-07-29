'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { useKeyboardNavigation } from '@/lib/hooks/use-keyboard-navigation'

interface KeyboardNavigableListProps<T> {
  items: T[]
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode
  onSelect?: (item: T, index: number) => void
  onDelete?: (item: T, index: number) => void
  className?: string
  itemClassName?: string
  activeClassName?: string
  orientation?: 'horizontal' | 'vertical'
  wrap?: boolean
  id?: string
  'aria-label'?: string
  role?: string
}

export function KeyboardNavigableList<T>({
  items,
  renderItem,
  onSelect,
  onDelete,
  className,
  itemClassName,
  activeClassName = 'ring-2 ring-primary',
  orientation = 'vertical',
  wrap = true,
  id,
  'aria-label': ariaLabel,
  role = 'list',
  ...props
}: KeyboardNavigableListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { currentIndex } = useKeyboardNavigation(containerRef, {
    onEnter: (element, index) => {
      onSelect?.(items[index], index)
    },
    onSpace: (element, index) => {
      onSelect?.(items[index], index)
    },
    enableWrapAround: wrap,
    orientation,
    selector: '[role="listitem"]',
  })

  // Handle delete key
  useKeyboardNavigation(containerRef, {
    onArrowDown: (element, index) => {
      if (element && onDelete && element.matches(':focus')) {
        element.addEventListener('keydown', (e) => {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault()
            onDelete(items[index], index)
          }
        }, { once: true })
      }
    },
  })

  return (
    <div
      ref={containerRef}
      id={id}
      role={role}
      aria-label={ariaLabel}
      className={cn(
        'focus-visible:outline-none',
        orientation === 'horizontal' ? 'flex flex-row gap-2' : 'flex flex-col gap-2',
        className
      )}
      {...props}
    >
      {items.map((item, index) => (
        <div
          key={index}
          role="listitem"
          tabIndex={index === 0 ? 0 : -1}
          className={cn(
            'focus-visible:outline-none rounded-md transition-all',
            itemClassName,
            currentIndex === index && activeClassName
          )}
          onClick={() => onSelect?.(item, index)}
          onKeyDown={(e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && onDelete) {
              e.preventDefault()
              onDelete(item, index)
            }
          }}
        >
          {renderItem(item, index, currentIndex === index)}
        </div>
      ))}
      {items.length === 0 && (
        <div 
          className="text-center text-muted-foreground py-8"
          role="status"
          aria-live="polite"
        >
          No items to display
        </div>
      )}
    </div>
  )
}

// Grid variant for keyboard navigation
interface KeyboardNavigableGridProps<T> extends KeyboardNavigableListProps<T> {
  columns?: number
}

export function KeyboardNavigableGrid<T>({
  items,
  columns = 3,
  className,
  ...props
}: KeyboardNavigableGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { currentIndex, focusElement } = useKeyboardNavigation(containerRef, {
    onEnter: (element, index) => {
      props.onSelect?.(items[index], index)
    },
    onSpace: (element, index) => {
      props.onSelect?.(items[index], index)
    },
    onArrowLeft: (element, index) => {
      const newIndex = index - 1
      if (newIndex >= 0) {
        focusElement(newIndex)
      }
    },
    onArrowRight: (element, index) => {
      const newIndex = index + 1
      if (newIndex < items.length) {
        focusElement(newIndex)
      }
    },
    onArrowUp: (element, index) => {
      const newIndex = index - columns
      if (newIndex >= 0) {
        focusElement(newIndex)
      }
    },
    onArrowDown: (element, index) => {
      const newIndex = index + columns
      if (newIndex < items.length) {
        focusElement(newIndex)
      }
    },
    enableWrapAround: false,
    orientation: 'both',
    selector: '[role="gridcell"]',
  })

  return (
    <div
      ref={containerRef}
      role="grid"
      aria-label={props['aria-label']}
      className={cn(
        'grid gap-4 focus-visible:outline-none',
        `grid-cols-${columns}`,
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={index}
          role="gridcell"
          tabIndex={index === 0 ? 0 : -1}
          className={cn(
            'focus-visible:outline-none rounded-md transition-all',
            props.itemClassName,
            currentIndex === index && props.activeClassName
          )}
          onClick={() => props.onSelect?.(item, index)}
          onKeyDown={(e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && props.onDelete) {
              e.preventDefault()
              props.onDelete(item, index)
            }
          }}
        >
          {props.renderItem(item, index, currentIndex === index)}
        </div>
      ))}
    </div>
  )
}