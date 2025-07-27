import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResetPasswordPage from '@/app/(auth)/reset-password/page'
import { createClient } from '@/lib/supabase/client'

vi.mock('@/lib/supabase/client')

describe('ResetPasswordPage', () => {
  const mockResetPasswordForEmail = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as any).mockReturnValue({
      auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
      },
    })
  })

  it('renders password reset form correctly', () => {
    render(<ResetPasswordPage />)

    expect(screen.getByRole('heading', { name: 'Reset password' })).toBeInTheDocument()
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument()
  })

  it('handles successful password reset request', async () => {
    const user = userEvent.setup()
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: null })

    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/auth/callback?type=recovery'),
      })
    })

    // Should show success message
    expect(screen.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    expect(screen.getByText(/We've sent a password reset link/i)).toBeInTheDocument()
  })

  it('displays error message on failed reset request', async () => {
    const user = userEvent.setup()
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: { message: 'User not found' },
    })

    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'nonexistent@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument()
    })
  })

  it('shows loading state during request', async () => {
    const user = userEvent.setup()
    mockResetPasswordForEmail.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(screen.getByText('Sending reset link...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sending reset link...' })).toBeDisabled()
  })

  it('has link back to sign in page', () => {
    render(<ResetPasswordPage />)

    const signInLink = screen.getByRole('link', { name: 'Sign in' })
    expect(signInLink).toHaveAttribute('href', '/login')
  })

  it('requires email input', async () => {
    const user = userEvent.setup()

    render(<ResetPasswordPage />)

    // Try to submit without email
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    // Form should not submit - HTML5 validation
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled()
  })
})