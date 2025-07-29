'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcuts'
import { Keyboard } from 'lucide-react'

interface ShortcutItem {
  keys: string[]
  description: string
  category?: string
}

const shortcuts: ShortcutItem[] = [
  // Navigation
  { keys: ['Tab'], description: 'Navigate forward', category: 'Navigation' },
  { keys: ['Shift', 'Tab'], description: 'Navigate backward', category: 'Navigation' },
  { keys: ['↑', '↓'], description: 'Navigate lists vertically', category: 'Navigation' },
  { keys: ['←', '→'], description: 'Navigate lists horizontally', category: 'Navigation' },
  { keys: ['Home'], description: 'Go to first item', category: 'Navigation' },
  { keys: ['End'], description: 'Go to last item', category: 'Navigation' },
  { keys: ['PageUp'], description: 'Scroll up one page', category: 'Navigation' },
  { keys: ['PageDown'], description: 'Scroll down one page', category: 'Navigation' },
  
  // Actions
  { keys: ['Enter'], description: 'Select/Activate item', category: 'Actions' },
  { keys: ['Space'], description: 'Toggle selection', category: 'Actions' },
  { keys: ['Escape'], description: 'Close dialog/Cancel', category: 'Actions' },
  { keys: ['Delete'], description: 'Delete selected item', category: 'Actions' },
  
  // File Management
  { keys: ['Ctrl/⌘', 'N'], description: 'Upload new file', category: 'Files' },
  { keys: ['Ctrl/⌘', 'O'], description: 'Open file', category: 'Files' },
  { keys: ['Ctrl/⌘', 'S'], description: 'Save changes', category: 'Files' },
  { keys: ['Ctrl/⌘', 'D'], description: 'Download file', category: 'Files' },
  
  // Editing
  { keys: ['Ctrl/⌘', 'A'], description: 'Select all', category: 'Editing' },
  { keys: ['Ctrl/⌘', 'C'], description: 'Copy', category: 'Editing' },
  { keys: ['Ctrl/⌘', 'X'], description: 'Cut', category: 'Editing' },
  { keys: ['Ctrl/⌘', 'V'], description: 'Paste', category: 'Editing' },
  { keys: ['Ctrl/⌘', 'Z'], description: 'Undo', category: 'Editing' },
  { keys: ['Ctrl/⌘', 'Shift', 'Z'], description: 'Redo', category: 'Editing' },
  
  // Search & Filter
  { keys: ['/'], description: 'Focus search', category: 'Search' },
  { keys: ['Ctrl/⌘', 'F'], description: 'Find in page', category: 'Search' },
  { keys: ['Ctrl/⌘', 'K'], description: 'Quick search', category: 'Search' },
  
  // Application
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Help' },
  { keys: ['Ctrl/⌘', ','], description: 'Open settings', category: 'Application' },
  { keys: ['Ctrl/⌘', 'Shift', 'P'], description: 'Command palette', category: 'Application' },
  { keys: ['Alt', 'M'], description: 'Toggle menu', category: 'Application' },
]

interface KeyboardShortcutsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ 
  open: controlledOpen, 
  onOpenChange 
}: KeyboardShortcutsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  // Register the ? shortcut to open the dialog
  useKeyboardShortcut('shift+?', () => {
    setOpen(true)
  })

  const categories = Array.from(new Set(shortcuts.map(s => s.category).filter(Boolean)))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick reference for all keyboard shortcuts available in CourseFlow
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={categories[0]} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-6 w-full">
            {categories.map(category => (
              <TabsTrigger key={category} value={category!}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex-1 overflow-y-auto">
            {categories.map(category => (
              <TabsContent key={category} value={category!} className="mt-4 space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <ShortcutRow key={index} shortcut={shortcut} />
                  ))}
              </TabsContent>
            ))}
          </div>
        </Tabs>
        
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          <p>
            <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">?</kbd>
            {' '}Press at any time to show this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutRow({ shortcut }: { shortcut: ShortcutItem }) {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50">
      <span className="text-sm">{shortcut.description}</span>
      <div className="flex gap-1">
        {shortcut.keys.map((key, index) => {
          // Replace Ctrl/⌘ with the appropriate symbol
          const displayKey = key === 'Ctrl/⌘' 
            ? (isMac ? '⌘' : 'Ctrl')
            : key
          
          return (
            <kbd
              key={index}
              className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded"
            >
              {displayKey}
            </kbd>
          )
        })}
      </div>
    </div>
  )
}

// Export a button to trigger the dialog
export function KeyboardShortcutsButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
        <span>Keyboard shortcuts</span>
        <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">?</kbd>
      </button>
      <KeyboardShortcutsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}