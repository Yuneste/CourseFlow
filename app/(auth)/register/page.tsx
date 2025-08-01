'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { validateEmail, validatePassword } from '@/lib/utils/validation'
import { cn } from '@/lib/utils'
import { lightThemeClasses } from '@/lib/theme/light-theme'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      toast.error('Invalid email address')
      setLoading(false)
      return
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0])
      toast.error('Password requirements not met', {
        description: passwordValidation.errors.join(', ')
      })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    if (!fullName.trim()) {
      setError('Please enter your full name')
      toast.error('Full name is required')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      toast.error('Failed to create account', {
        description: error.message
      })
      setLoading(false)
    } else {
      toast.success('Account created!', {
        description: 'Please check your email to verify your account'
      })
      setSuccess(true)
    }
  }

  const handleOAuthSignUp = async (provider: 'google') => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className={cn(lightThemeClasses.card.base, "w-full max-w-md shadow-xl")}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Check your email</CardTitle>
          <CardDescription className="text-gray-600">
            We&apos;ve sent you a verification link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Please check your email and click the verification link to complete your registration.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="text-sm text-[#8CC2BE] hover:underline font-medium">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={cn(lightThemeClasses.card.base, "w-full max-w-md shadow-xl")}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-gray-900">Create an account</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignUp('google')}
          disabled={loading}
          className={cn("w-full", lightThemeClasses.button.secondary)}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign up with Google
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
              className={lightThemeClasses.input.base}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className={lightThemeClasses.input.base}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className={lightThemeClasses.input.base}
            />
            <p className="text-xs text-gray-500 mt-1">
              At least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className={lightThemeClasses.input.base}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
          
          <Button type="submit" className={cn("w-full", lightThemeClasses.button.primary)} disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-[#8CC2BE] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}