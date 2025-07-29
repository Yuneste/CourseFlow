import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

export function LoadingSpinner({ className, size = "md", text }: LoadingSpinnerProps) {
  if (text) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Loader2 
          className={cn(
            "animate-spin text-primary",
            sizeClasses[size]
          )} 
        />
        <span className="text-sm text-muted-foreground">{text}</span>
      </div>
    )
  }

  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )} 
    />
  )
}

interface LoadingContainerProps {
  children?: React.ReactNode
  className?: string
}

export function LoadingContainer({ children, className }: LoadingContainerProps) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="lg" />
        {children && (
          <p className="text-sm text-muted-foreground">{children}</p>
        )}
      </div>
    </div>
  )
}