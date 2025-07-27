import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import UpdatePasswordPage from '@/app/(auth)/update-password/page'
import { createClient } from '@/lib/supabase/client'

vi.mock('next/navigation')
vi.mock('@/lib/supabase/client')

// Mock Suspense to avoid issues in tests
vi.mock('react', async () => ({
  ...(await vi.importActual('react')),
  Suspense: ({ children }: { children: React.ReactNode }) => children,
}))

describe('UpdatePasswordPage', () => {
  const mockPush = vi.fn()
  const mockUpdateUser = vi.fn()
  const mockGetSession = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
    })
    ;(createClient as any).mockReturnValue({
      auth: {
        updateUser: mockUpdateUser,
        getSession: mockGetSession,
      },
    })
  })

  it('renders update password form correctly', () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: {} } } })
    
    render(<UpdatePasswordPage />)

    expect(screen.getByRole('heading', { name: 'Update password' })).toBeInTheDocument()
    expect(screen.getByText(/enter your new password/i)).toBeInTheDocument()
    expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update password' })).toBeInTheDocument()
  })

  it('handles successful password update', async () => {
    const user = userEvent.setup()
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: {} } } })
    mockUpdateUser.mockResolvedValueOnce({ error: null })

    render(<UpdatePasswordPage />)

    await user.type(screen.getByLabelText('New Password'), 'newpassword123')
    await user.type(screen.getByLabelText('Confirm New Password'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('validates password match', async () => {
    const user = userEvent.setup()
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: {} } } })

    render(<UpdatePasswordPage />)

    await user.type(screen.getByLabelText('New Password'), 'newpassword123')
    await user.type(screen.getByLabelText('Confirm New Password'), 'differentpassword')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: {} } } })

    render(<UpdatePasswordPage />)

    await user.type(screen.getByLabelText('New Password'), 'short')
    await user.type(screen.getByLabelText('Confirm New Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })
  })

  it('displays error message on failed update', async () => {
    const user = userEvent.setup()
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: {} } } })
    mockUpdateUser.mockResolvedValueOnce({
      error: { message: 'Password update failed' },
    })

    render(<UpdatePasswordPage />)

    await user.type(screen.getByLabelText('New Password'), 'newpassword123')
    await user.type(screen.getByLabelText('Confirm New Password'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    await waitFor(() => {
      expect(screen.getByText('Password update failed')).toBeInTheDocument()
    })
  })

  it('shows loading state during update', async () => {
    const user = userEvent.setup()
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: {} } } })
    mockUpdateUser.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<UpdatePasswordPage />)

    await user.type(screen.getByLabelText('New Password'), 'newpassword123')
    await user.type(screen.getByLabelText('Confirm New Password'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(screen.getByText('Updating password...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Updating password...' })).toBeDisabled()
  })
})