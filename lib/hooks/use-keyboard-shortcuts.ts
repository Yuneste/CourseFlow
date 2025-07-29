import { useEffect, useCallback, useRef } from 'react'

type ModifierKey = 'ctrl' | 'cmd' | 'alt' | 'shift' | 'meta'
type KeyCombo = {
  key: string
  modifiers?: ModifierKey[]
  preventDefault?: boolean
  stopPropagation?: boolean
  when?: () => boolean
}

type ShortcutHandler = (event: KeyboardEvent) => void

export function useKeyboardShortcut(
  keyCombo: string | KeyCombo,
  handler: ShortcutHandler,
  options: {
    enabled?: boolean
    target?: React.RefObject<HTMLElement> | HTMLElement | Window
  } = {}
) {
  const { enabled = true, target = window } = options
  const handlerRef = useRef(handler)
  
  // Update handler ref to avoid stale closures
  handlerRef.current = handler

  const parseKeyCombo = useCallback((combo: string | KeyCombo): KeyCombo => {
    if (typeof combo === 'object') return combo

    // Parse string format like "ctrl+shift+k" or "cmd+k"
    const parts = combo.toLowerCase().split('+')
    const key = parts[parts.length - 1]
    const modifiers = parts.slice(0, -1) as ModifierKey[]

    return { key, modifiers }
  }, [])

  const checkModifiers = useCallback((event: KeyboardEvent, modifiers: ModifierKey[] = []) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    
    return modifiers.every(modifier => {
      switch (modifier) {
        case 'ctrl':
          return isMac ? event.metaKey : event.ctrlKey
        case 'cmd':
          return isMac ? event.metaKey : event.ctrlKey
        case 'meta':
          return event.metaKey
        case 'alt':
          return event.altKey
        case 'shift':
          return event.shiftKey
        default:
          return false
      }
    })
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const combo = parseKeyCombo(keyCombo)
      
      // Check if the condition is met
      if (combo.when && !combo.when()) return
      
      // Check if the key matches
      if (event.key.toLowerCase() !== combo.key.toLowerCase()) return
      
      // Check if modifiers match
      if (!checkModifiers(event, combo.modifiers)) return
      
      // Prevent default behavior if specified
      if (combo.preventDefault !== false) {
        event.preventDefault()
      }
      
      if (combo.stopPropagation) {
        event.stopPropagation()
      }
      
      // Call the handler
      handlerRef.current(event)
    }

    const targetElement = target instanceof HTMLElement || target === window
      ? target
      : target.current

    if (targetElement) {
      targetElement.addEventListener('keydown', handleKeyDown as any)
      return () => targetElement.removeEventListener('keydown', handleKeyDown as any)
    }
  }, [enabled, keyCombo, target, parseKeyCombo, checkModifiers])
}

// Hook for multiple shortcuts
export function useKeyboardShortcuts(
  shortcuts: Record<string, ShortcutHandler | { handler: ShortcutHandler; description?: string }>,
  options: {
    enabled?: boolean
    target?: React.RefObject<HTMLElement> | HTMLElement | Window
    enableHelp?: boolean
  } = {}
) {
  const { enabled = true, target = window, enableHelp = true } = options

  // Register each shortcut
  Object.entries(shortcuts).forEach(([keyCombo, handlerOrConfig]) => {
    const handler = typeof handlerOrConfig === 'function' 
      ? handlerOrConfig 
      : handlerOrConfig.handler
    
    useKeyboardShortcut(keyCombo, handler, { enabled, target })
  })

  // Register help shortcut if enabled
  useKeyboardShortcut('shift+?', () => {
    if (enableHelp) {
      showShortcutHelp(shortcuts)
    }
  }, { enabled: enabled && enableHelp, target })

  return {
    shortcuts: Object.entries(shortcuts).map(([keyCombo, handlerOrConfig]) => ({
      keyCombo,
      description: typeof handlerOrConfig === 'object' ? handlerOrConfig.description : undefined
    }))
  }
}

// Helper to show keyboard shortcuts
function showShortcutHelp(shortcuts: Record<string, any>) {
  console.log('Keyboard Shortcuts:')
  Object.entries(shortcuts).forEach(([keyCombo, handlerOrConfig]) => {
    const description = typeof handlerOrConfig === 'object' 
      ? handlerOrConfig.description 
      : 'No description'
    console.log(`${keyCombo}: ${description}`)
  })
}

// Common keyboard shortcuts for CourseFlow
export const commonShortcuts = {
  search: { key: '/', description: 'Focus search' },
  newFile: { key: 'n', modifiers: ['ctrl'] as ModifierKey[], description: 'Upload new file' },
  newCourse: { key: 'c', modifiers: ['ctrl'] as ModifierKey[], description: 'Create new course' },
  help: { key: '?', modifiers: ['shift'] as ModifierKey[], description: 'Show keyboard shortcuts' },
  escape: { key: 'Escape', description: 'Close dialog/Cancel action' },
  save: { key: 's', modifiers: ['ctrl'] as ModifierKey[], description: 'Save changes' },
  delete: { key: 'Delete', description: 'Delete selected item' },
  selectAll: { key: 'a', modifiers: ['ctrl'] as ModifierKey[], description: 'Select all items' },
  copy: { key: 'c', modifiers: ['ctrl'] as ModifierKey[], description: 'Copy selected' },
  paste: { key: 'v', modifiers: ['ctrl'] as ModifierKey[], description: 'Paste' },
  undo: { key: 'z', modifiers: ['ctrl'] as ModifierKey[], description: 'Undo' },
  redo: { key: 'z', modifiers: ['ctrl', 'shift'] as ModifierKey[], description: 'Redo' },
}

// Hook for handling copy/paste operations
export function useClipboardShortcuts(options: {
  onCopy?: () => string | void
  onPaste?: (text: string) => void
  onCut?: () => string | void
  enabled?: boolean
} = {}) {
  const { onCopy, onPaste, onCut, enabled = true } = options

  useKeyboardShortcut('ctrl+c', async (event) => {
    if (onCopy) {
      const text = onCopy()
      if (text) {
        event.preventDefault()
        await navigator.clipboard.writeText(text)
      }
    }
  }, { enabled })

  useKeyboardShortcut('ctrl+v', async (event) => {
    if (onPaste) {
      event.preventDefault()
      const text = await navigator.clipboard.readText()
      onPaste(text)
    }
  }, { enabled })

  useKeyboardShortcut('ctrl+x', async (event) => {
    if (onCut) {
      const text = onCut()
      if (text) {
        event.preventDefault()
        await navigator.clipboard.writeText(text)
      }
    }
  }, { enabled })
}