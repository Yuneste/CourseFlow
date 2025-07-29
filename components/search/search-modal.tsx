'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { 
  Search, 
  FileText, 
  BookOpen, 
  User, 
  Settings,
  Home,
  X
} from 'lucide-react'

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SearchResult = {
  id: string
  title: string
  description?: string
  type: 'page' | 'course' | 'file' | 'setting'
  url: string
  icon: any
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Dashboard',
    description: 'View your overview and recent activity',
    type: 'page',
    url: '/dashboard',
    icon: Home
  },
  {
    id: '2',
    title: 'My Courses',
    description: 'View and manage all your courses',
    type: 'page',
    url: '/courses',
    icon: BookOpen
  },
  {
    id: '3',
    title: 'Profile Settings',
    description: 'Update your profile information',
    type: 'setting',
    url: '/settings/profile',
    icon: User
  },
  {
    id: '4',
    title: 'General Settings',
    description: 'Configure your preferences',
    type: 'setting',
    url: '/settings',
    icon: Settings
  }
]

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>(mockResults)

  // Filter results based on search query
  useEffect(() => {
    if (!search) {
      setResults(mockResults)
      return
    }

    const filtered = mockResults.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    )
    setResults(filtered)
  }, [search])

  const handleSelect = useCallback((result: SearchResult) => {
    onOpenChange(false)
    router.push(result.url)
  }, [router, onOpenChange])

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(true)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search CourseFlow..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="ml-2 rounded-sm opacity-70 ring-offset-background hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm">
              No results found.
            </Command.Empty>
            
            {results.length > 0 && (
              <Command.Group heading="Suggestions">
                {results.map((result) => {
                  const Icon = result.icon
                  return (
                    <Command.Item
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="relative flex cursor-pointer select-none items-center gap-3 rounded-md px-2 py-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground"
                    >
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md",
                        result.type === 'page' && "bg-[#ECF0C0]",
                        result.type === 'course' && "bg-[#F0C4C0]",
                        result.type === 'file' && "bg-[#C0ECF0]",
                        result.type === 'setting' && "bg-[#C7C7AD]/20"
                      )}>
                        <Icon className="h-4 w-4 text-[#1a1a1a]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{result.title}</span>
                        {result.description && (
                          <span className="text-xs text-muted-foreground">
                            {result.description}
                          </span>
                        )}
                      </div>
                    </Command.Item>
                  )
                })}
              </Command.Group>
            )}
          </Command.List>
          <div className="border-t px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd> to open search
            </p>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}