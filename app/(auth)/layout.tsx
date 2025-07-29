import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FFF5F5] via-white to-[#FFF8F5]">
      {/* Header */}
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <GraduationCap className="h-8 w-8 text-[#FA8072]" />
          <span className="text-2xl font-bold bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] bg-clip-text text-transparent">
            CourseFlow
          </span>
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {children}
        </div>
      </div>
    </div>
  )
}