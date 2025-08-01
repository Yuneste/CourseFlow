import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { UnifiedBackground } from '@/components/ui/unified-background'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UnifiedBackground>
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
        <div className="max-w-md w-full relative z-10">
          {children}
        </div>
      </div>
    </UnifiedBackground>
  )
}