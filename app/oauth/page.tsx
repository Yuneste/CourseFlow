'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function OAuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    
    if (code) {
      // Redirect to auth callback with all params
      const params = new URLSearchParams(searchParams.toString())
      router.push(`/auth/callback?${params.toString()}`)
    } else {
      // No code, redirect to login
      router.push('/login')
    }
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Completing authentication...</p>
    </div>
  )
}

export default function OAuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <OAuthHandler />
    </Suspense>
  )
}