'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Command } from 'lucide-react'

interface KeyboardShortcutsModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open search' },
  { keys: ['⌘', 'H'], description: 'Go to dashboard' },
  { keys: ['⌘', 'C'], description: 'Go to courses' },
  { keys: ['⌘', 'N'], description: 'Create new course' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['Esc'], description: 'Close modals' },
]

export function KeyboardShortcutsModal({ 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: KeyboardShortcutsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const open = controlledOpen ?? internalOpen
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen

  useEffect(() => {
    const handleShowShortcuts = () => onOpenChange(true)
    window.addEventListener('showKeyboardShortcuts', handleShowShortcuts)
    return () => window.removeEventListener('showKeyboardShortcuts', handleShowShortcuts)
  }, [onOpenChange])

  // Platform detection for correct modifier key display
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Press these keys to quickly navigate CourseFlow
          </p>
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <kbd
                      key={keyIndex}
                      className="pointer-events-none inline-flex h-6 min-w-[24px] select-none items-center justify-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground"
                    >
                      {key === '⌘' && !isMac ? 'Ctrl' : key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Pro tip: Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">?</kbd> anytime to see these shortcuts
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}