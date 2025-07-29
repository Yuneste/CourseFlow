import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface ShortcutConfig {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    shortcuts.forEach(shortcut => {
      const ctrlKey = shortcut.ctrl ?? false
      const metaKey = shortcut.meta ?? false
      const shiftKey = shortcut.shift ?? false
      const altKey = shortcut.alt ?? false

      const ctrlOrMeta = ctrlKey ? event.ctrlKey : metaKey ? event.metaKey : true
      const matchesModifiers = 
        ctrlOrMeta &&
        (shiftKey ? event.shiftKey : !event.shiftKey) &&
        (altKey ? event.altKey : !event.altKey)

      if (event.key.toLowerCase() === shortcut.key.toLowerCase() && matchesModifiers) {
        event.preventDefault()
        shortcut.action()
      }
    })
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export function useGlobalKeyboardShortcuts() {
  const router = useRouter()

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'k',
      meta: true,
      action: () => {
        // Trigger search modal
        window.dispatchEvent(new CustomEvent('openSearch'))
      },
      description: 'Open search'
    },
    {
      key: 'h',
      meta: true,
      action: () => router.push('/dashboard'),
      description: 'Go to home'
    },
    {
      key: 'c',
      meta: true,
      action: () => router.push('/courses'),
      description: 'Go to courses'
    },
    {
      key: 'n',
      meta: true,
      action: () => router.push('/courses/new'),
      description: 'Create new course'
    },
    {
      key: '?',
      shift: true,
      action: () => {
        // Show keyboard shortcuts help
        window.dispatchEvent(new CustomEvent('showKeyboardShortcuts'))
      },
      description: 'Show keyboard shortcuts'
    }
  ]

  useKeyboardShortcuts(shortcuts)

  return shortcuts
}