import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: boolean
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
}

export const ResponsiveContainer = forwardRef<
  HTMLDivElement,
  ResponsiveContainerProps
>(({ className, as: Component = "div", maxWidth = "2xl", padding = true, ...props }, ref) => {
  return (
    <Component
      ref={ref}
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        padding && "px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  )
})

ResponsiveContainer.displayName = "ResponsiveContainer"