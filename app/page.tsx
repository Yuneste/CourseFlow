'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Check if this is an OAuth callback
    const code = searchParams.get('code')
    if (code) {
      // Redirect to auth callback with the code
      router.push(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">CourseFlow</h1>
      <p className="mt-4 text-xl text-gray-600">Academic File Organization Platform</p>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">CourseFlow</h1>
        <p className="mt-4 text-xl text-gray-600">Loading...</p>
      </main>
    }>
      <HomeContent />
    </Suspense>
  )
}