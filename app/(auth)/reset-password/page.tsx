'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-[#C7C7AD]/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#1a1a1a]">Check your email</CardTitle>
          <CardDescription className="text-[#1a1a1a]/70">
            We&apos;ve sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#1a1a1a]/60">
            Click the link in your email to reset your password. 
            If you don&apos;t see the email, check your spam folder.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="text-sm text-[#1a1a1a] hover:underline font-medium">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-[#C7C7AD]/30 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-[#1a1a1a]">Reset password</CardTitle>
        <CardDescription className="text-[#1a1a1a]/70">
          Enter your email address and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#1a1a1a]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full bg-[#F0C4C0] hover:bg-[#F0C4C0]/90 text-[#1a1a1a]" disabled={loading}>
            {loading ? 'Sending reset link...' : 'Send reset link'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-[#C7C7AD]">
          Remember your password?{' '}
          <Link href="/login" className="text-[#1a1a1a] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}