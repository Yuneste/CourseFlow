import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { lightThemeClasses } from '@/lib/theme/light-theme'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={lightThemeClasses.page.wrapper + " min-h-screen flex flex-col"}>
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 w-fit group">
          <div className="p-3 bg-[#8CC2BE] rounded-lg group-hover:scale-110 transition-transform shadow-sm">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">
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
    </div>
  )
}