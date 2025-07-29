import { useEffect, useRef, useCallback } from 'react'

interface UseKeyboardNavigationOptions {
  onEnter?: (element: HTMLElement, index: number) => void
  onSpace?: (element: HTMLElement, index: number) => void
  onEscape?: () => void
  onArrowUp?: (element: HTMLElement, index: number) => void
  onArrowDown?: (element: HTMLElement, index: number) => void
  onArrowLeft?: (element: HTMLElement, index: number) => void
  onArrowRight?: (element: HTMLElement, index: number) => void
  onHome?: () => void
  onEnd?: () => void
  onTab?: (event: KeyboardEvent) => void
  enableWrapAround?: boolean
  orientation?: 'horizontal' | 'vertical' | 'both'
  selector?: string
}

export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: UseKeyboardNavigationOptions = {}
) {
  const {
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    onTab,
    enableWrapAround = true,
    orientation = 'vertical',
    selector = '[tabindex]:not([tabindex="-1"]), a, button, input, select, textarea'
  } = options

  const currentIndexRef = useRef(-1)

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []
    return Array.from(containerRef.current.querySelectorAll(selector))
      .filter((el): el is HTMLElement => {
        return el instanceof HTMLElement && 
               !el.hasAttribute('disabled') &&
               !el.hasAttribute('aria-disabled') &&
               el.offsetParent !== null // visible
      })
  }, [containerRef, selector])

  const focusElement = useCallback((index: number) => {
    const elements = getFocusableElements()
    if (elements[index]) {
      elements[index].focus()
      currentIndexRef.current = index
    }
  }, [getFocusableElements])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const elements = getFocusableElements()
    if (elements.length === 0) return

    const currentIndex = elements.findIndex(el => el === document.activeElement)
    currentIndexRef.current = currentIndex

    switch (event.key) {
      case 'Enter':
        if (currentIndex >= 0 && onEnter) {
          event.preventDefault()
          onEnter(elements[currentIndex], currentIndex)
        }
        break

      case ' ':
      case 'Space':
        if (currentIndex >= 0 && onSpace) {
          event.preventDefault()
          onSpace(elements[currentIndex], currentIndex)
        }
        break

      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape()
        }
        break

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault()
          let prevIndex = currentIndex - 1
          
          if (prevIndex < 0) {
            prevIndex = enableWrapAround ? elements.length - 1 : 0
          }
          
          focusElement(prevIndex)
          onArrowUp?.(elements[prevIndex], prevIndex)
        }
        break

      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault()
          let nextIndex = currentIndex + 1
          
          if (nextIndex >= elements.length) {
            nextIndex = enableWrapAround ? 0 : elements.length - 1
          }
          
          focusElement(nextIndex)
          onArrowDown?.(elements[nextIndex], nextIndex)
        }
        break

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          let prevIndex = currentIndex - 1
          
          if (prevIndex < 0) {
            prevIndex = enableWrapAround ? elements.length - 1 : 0
          }
          
          focusElement(prevIndex)
          onArrowLeft?.(elements[prevIndex], prevIndex)
        }
        break

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          let nextIndex = currentIndex + 1
          
          if (nextIndex >= elements.length) {
            nextIndex = enableWrapAround ? 0 : elements.length - 1
          }
          
          focusElement(nextIndex)
          onArrowRight?.(elements[nextIndex], nextIndex)
        }
        break

      case 'Home':
        event.preventDefault()
        focusElement(0)
        onHome?.()
        break

      case 'End':
        event.preventDefault()
        focusElement(elements.length - 1)
        onEnd?.()
        break

      case 'Tab':
        if (onTab) {
          onTab(event)
        }
        break
    }
  }, [
    getFocusableElements,
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    onTab,
    enableWrapAround,
    orientation,
    focusElement
  ])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, handleKeyDown])

  return {
    focusElement,
    getFocusableElements,
    currentIndex: currentIndexRef.current
  }
}

// Hook for managing focus trap (e.g., in modals)
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  options: {
    initialFocus?: string
    returnFocus?: boolean
    escapeDeactivates?: boolean
    onEscape?: () => void
  } = {}
) {
  const {
    initialFocus,
    returnFocus = true,
    escapeDeactivates = true,
    onEscape
  } = options

  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Store the previously focused element
    if (returnFocus) {
      previousActiveElementRef.current = document.activeElement as HTMLElement
    }

    // Focus initial element or first focusable element
    const focusableElements = container.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )
    
    if (initialFocus) {
      const initialElement = container.querySelector(initialFocus) as HTMLElement
      initialElement?.focus()
    } else if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusable = Array.from(focusableElements) as HTMLElement[]
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      } else if (event.key === 'Escape' && escapeDeactivates) {
        event.preventDefault()
        onEscape?.()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      
      // Return focus to previous element
      if (returnFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus()
      }
    }
  }, [containerRef, initialFocus, returnFocus, escapeDeactivates, onEscape])
}

// Hook for roving tabindex pattern
export function useRovingTabIndex(
  containerRef: React.RefObject<HTMLElement>,
  options: {
    selector?: string
    orientation?: 'horizontal' | 'vertical' | 'both'
    loop?: boolean
  } = {}
) {
  const {
    selector = '[data-roving-tabindex]',
    orientation = 'vertical',
    loop = true
  } = options

  const currentIndexRef = useRef(0)

  const updateTabIndices = useCallback((newIndex: number) => {
    if (!containerRef.current) return

    const items = containerRef.current.querySelectorAll(selector)
    items.forEach((item, index) => {
      if (index === newIndex) {
        item.setAttribute('tabindex', '0')
        ;(item as HTMLElement).focus()
      } else {
        item.setAttribute('tabindex', '-1')
      }
    })
    currentIndexRef.current = newIndex
  }, [containerRef, selector])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Initialize tabindex
    const items = container.querySelectorAll(selector)
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1')
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      const items = container.querySelectorAll(selector)
      const count = items.length
      if (count === 0) return

      let newIndex = currentIndexRef.current
      let handled = false

      switch (event.key) {
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = currentIndexRef.current - 1
            if (newIndex < 0) newIndex = loop ? count - 1 : 0
            handled = true
          }
          break

        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = currentIndexRef.current + 1
            if (newIndex >= count) newIndex = loop ? 0 : count - 1
            handled = true
          }
          break

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = currentIndexRef.current - 1
            if (newIndex < 0) newIndex = loop ? count - 1 : 0
            handled = true
          }
          break

        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = currentIndexRef.current + 1
            if (newIndex >= count) newIndex = loop ? 0 : count - 1
            handled = true
          }
          break

        case 'Home':
          newIndex = 0
          handled = true
          break

        case 'End':
          newIndex = count - 1
          handled = true
          break
      }

      if (handled) {
        event.preventDefault()
        updateTabIndices(newIndex)
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef, selector, orientation, loop, updateTabIndices])

  return { updateTabIndices, currentIndex: currentIndexRef.current }
}