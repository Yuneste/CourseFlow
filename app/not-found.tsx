'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ECF0C0] via-[#F0C4C0]/20 to-[#ECF0C0]">
      <div className="text-center px-4 py-8 max-w-lg mx-auto">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#1a1a1a] mb-4">404</h1>
          <div className="relative">
            <div className="w-64 h-64 mx-auto bg-[#F0C4C0]/20 rounded-full blur-3xl absolute -top-32 left-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <svg
                className="w-48 h-48 mx-auto text-[#1a1a1a]/20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">
          Page Not Found
        </h2>
        <p className="text-[#1a1a1a]/70 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button className="bg-[#F0C4C0] hover:bg-[#F0C4C0]/90 text-[#1a1a1a]">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-[#C7C7AD]/40 hover:bg-[#F0C4C0]/20">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8">
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="inline-flex items-center gap-2 text-sm text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Try searching for what you need</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>
    </div>
  )
}