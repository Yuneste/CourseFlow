'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { generateAcademicTerms, getCurrentTerm } from '@/lib/academic-systems'

interface TermFilterProps {
  countryCode: string
  onTermChange: (term: string) => void
  className?: string
  variant?: 'default' | 'compact'
}

export function TermFilter({ 
  countryCode, 
  onTermChange, 
  className,
  variant = 'default' 
}: TermFilterProps) {
  const [selectedTerm, setSelectedTerm] = useState<string>('All Terms')
  const [terms, setTerms] = useState<string[]>([])
  const [currentTerm, setCurrentTerm] = useState<string>('')

  useEffect(() => {
    const generatedTerms = generateAcademicTerms(countryCode)
    const current = getCurrentTerm(countryCode)
    setTerms(generatedTerms)
    setCurrentTerm(current)
  }, [countryCode])

  const handleTermSelect = (term: string) => {
    setSelectedTerm(term)
    onTermChange(term === 'All Terms' ? '' : term)
  }

  const isCompact = variant === 'compact'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={isCompact ? "sm" : "default"}
          className={cn(
            "justify-between gap-2",
            isCompact ? "h-9 px-3" : "min-w-[140px] sm:min-w-[180px]",
            className
          )}
        >
          {isCompact ? (
            <>
              <Calendar className="h-4 w-4" />
              <span className="sr-only">Filter by term</span>
            </>
          ) : (
            <>
              <span className="truncate text-sm">{selectedTerm}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[200px] max-h-[300px] overflow-y-auto"
      >
        <DropdownMenuItem
          onClick={() => handleTermSelect('All Terms')}
          className={selectedTerm === 'All Terms' ? 'bg-accent' : ''}
        >
          All Terms
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {terms.slice(0, 10).map((term) => (
          <DropdownMenuItem
            key={term}
            onClick={() => handleTermSelect(term)}
            className={cn(
              selectedTerm === term && 'bg-accent',
              term === currentTerm && 'font-semibold'
            )}
          >
            {term}
            {term === currentTerm && (
              <span className="ml-2 text-xs text-muted-foreground">(Current)</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}