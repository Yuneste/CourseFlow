'use client'

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"

interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
  className?: string
  children?: React.ReactNode
}

export function Header({ 
  onMenuClick, 
  showMenuButton = false, 
  className,
  children 
}: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-14 items-center">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
        
        <div className="flex flex-1 items-center justify-between space-x-2 sm:space-x-4">
          <div className="flex-1">
            {children}
          </div>
          
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}