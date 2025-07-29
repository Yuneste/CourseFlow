'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { useFocusTrap } from '@/lib/hooks/use-keyboard-navigation'

interface FocusTrapProps {
  children: ReactNode
  active?: boolean
  initialFocus?: string
  returnFocus?: boolean
  onEscape?: () => void
  className?: string
}

export function FocusTrap({
  children,
  active = true,
  initialFocus,
  returnFocus = true,
  onEscape,
  className
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useFocusTrap(containerRef, {
    initialFocus,
    returnFocus: active && returnFocus,
    escapeDeactivates: true,
    onEscape
  })

  if (!active) {
    return <>{children}</>
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Focus restoration component
interface FocusRestorerProps {
  children: ReactNode
}

export function FocusRestorer({ children }: FocusRestorerProps) {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement

    return () => {
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus()
      }
    }
  }, [])

  return <>{children}</>
}

// Auto-focus component
interface AutoFocusProps {
  children: ReactNode
  delay?: number
  selector?: string
}

export function AutoFocus({ children, delay = 0, selector }: AutoFocusProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (containerRef.current) {
        const target = selector
          ? containerRef.current.querySelector(selector) as HTMLElement
          : containerRef.current.querySelector('[tabindex]:not([tabindex="-1"]), a, button, input, select, textarea') as HTMLElement
        
        if (target) {
          target.focus()
        }
      }
    }, delay)

    return () => clearTimeout(timeout)
  }, [delay, selector])

  return <div ref={containerRef}>{children}</div>
}

// Focus guard to prevent focus from leaving a container
export function FocusGuard() {
  return (
    <div
      tabIndex={0}
      aria-hidden="true"
      style={{ position: 'fixed', top: 0, left: 0, width: 1, height: 1 }}
      onFocus={(e) => {
        // Find the nearest focusable element within the trap
        const trap = e.currentTarget.parentElement
        if (trap) {
          const focusable = trap.querySelector(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement
          if (focusable) {
            focusable.focus()
          }
        }
      }}
    />
  )
}

// Focus lock component that prevents focus from escaping
interface FocusLockProps {
  children: ReactNode
  disabled?: boolean
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function FocusLock({
  children,
  disabled = false,
  className,
  as: Component = 'div'
}: FocusLockProps) {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <Component className={className}>
      <FocusGuard />
      {children}
      <FocusGuard />
    </Component>
  )
}