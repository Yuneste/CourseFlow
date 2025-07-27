import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { LogoutButton } from '@/components/auth/logout-button'
import { createClient } from '@/lib/supabase/client'

vi.mock('next/navigation')
vi.mock('@/lib/supabase/client')

describe('LogoutButton', () => {
  const mockPush = vi.fn()
  const mockSignOut = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
    })
    ;(createClient as any).mockReturnValue({
      auth: {
        signOut: mockSignOut,
      },
    })
  })

  it('renders logout button correctly', () => {
    render(<LogoutButton />)

    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
  })

  it('handles successful logout', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValueOnce({ error: null })

    render(<LogoutButton />)

    await user.click(screen.getByRole('button', { name: 'Log out' }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('handles logout error gracefully', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValueOnce({ error: { message: 'Logout failed' } })

    render(<LogoutButton />)

    await user.click(screen.getByRole('button', { name: 'Log out' }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      // Should still redirect even if logout fails
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

})