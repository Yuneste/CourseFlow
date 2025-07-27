import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import RegisterPage from '@/app/(auth)/register/page'
import { createClient } from '@/lib/supabase/client'

vi.mock('next/navigation')
vi.mock('@/lib/supabase/client')

describe('RegisterPage', () => {
  const mockPush = vi.fn()
  const mockSignUp = vi.fn()
  const mockSignInWithOAuth = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
    })
    ;(createClient as any).mockReturnValue({
      auth: {
        signUp: mockSignUp,
        signInWithOAuth: mockSignInWithOAuth,
      },
    })
  })

  it('renders registration form correctly', () => {
    render(<RegisterPage />)

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
  })

  it('handles successful registration', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValueOnce({ error: null })

    render(<RegisterPage />)

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'John Doe',
          },
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })

    // Should show success message
    expect(screen.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    expect(screen.getByText(/we've sent you a verification link/i)).toBeInTheDocument()
  })

  it('validates password match', async () => {
    const user = userEvent.setup()

    render(<RegisterPage />)

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'differentpassword')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup()

    render(<RegisterPage />)

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.type(screen.getByLabelText('Confirm Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  it('displays error message on failed registration', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValueOnce({
      error: { message: 'Email already registered' },
    })

    render(<RegisterPage />)

    await user.type(screen.getByLabelText('Full Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'existing@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })
  })

  it('handles Google OAuth registration', async () => {
    const user = userEvent.setup()
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null })

    render(<RegisterPage />)

    await user.click(screen.getByRole('button', { name: /sign up with google/i }))

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
    })
  })

  it('has link to sign in page', () => {
    render(<RegisterPage />)

    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toHaveAttribute('href', '/login')
  })
})