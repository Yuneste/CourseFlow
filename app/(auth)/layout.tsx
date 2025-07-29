import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-accent/20 to-secondary/30">
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 w-fit group">
          <div className="p-2 bg-card/80 backdrop-blur-sm rounded-lg group-hover:scale-110 transition-transform shadow-sm border border-border">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            CourseFlow
          </span>
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}