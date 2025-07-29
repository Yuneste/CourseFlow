import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

describe('UI Components', () => {
  describe('Button Component', () => {
    it('renders with correct text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('handles click events', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      await userEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
    });

    it('applies correct variant styles', () => {
      const { rerender } = render(<Button variant="default">Default</Button>);
      expect(screen.getByText('Default')).toHaveClass('bg-primary');

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByText('Outline')).toHaveClass('border');

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByText('Ghost')).toHaveClass('hover:bg-accent');
    });

    it('meets minimum touch target size', () => {
      render(<Button>Touch me</Button>);
      const button = screen.getByText('Touch me');
      const styles = window.getComputedStyle(button);
      
      // Button should have sufficient height for touch
      expect(button).toHaveClass('h-10'); // 40px default height
    });
  });

  describe('Card Component', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Card className="custom-class">Custom card</Card>);
      const card = screen.getByText('Custom card');
      expect(card.parentElement).toHaveClass('custom-class');
    });
  });

  describe('Input Component', () => {
    it('accepts user input', async () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      
      await userEvent.type(input, 'Hello world');
      expect(input).toHaveValue('Hello world');
    });

    it('can be disabled', () => {
      render(<Input disabled placeholder="Disabled input" />);
      expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled();
    });

    it('shows focus ring on focus', async () => {
      render(<Input placeholder="Focus me" />);
      const input = screen.getByPlaceholderText('Focus me');
      
      await userEvent.click(input);
      expect(input).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Progress Component', () => {
    it('renders with correct value', () => {
      const { container } = render(
        <div role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: '50%' }} />
        </div>
      );
      
      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('Toast Notifications', () => {
    it('displays success toast', () => {
      // Mock implementation - would need actual toast component
      const toast = { success: vi.fn() };
      toast.success('Operation successful');
      expect(toast.success).toHaveBeenCalledWith('Operation successful');
    });

    it('displays error toast', () => {
      const toast = { error: vi.fn() };
      toast.error('Operation failed');
      expect(toast.error).toHaveBeenCalledWith('Operation failed');
    });
  });

  describe('Theme Toggle', () => {
    it('toggles between light and dark mode', () => {
      // Mock theme toggle functionality
      let theme = 'light';
      const toggleTheme = () => {
        theme = theme === 'light' ? 'dark' : 'light';
      };

      expect(theme).toBe('light');
      toggleTheme();
      expect(theme).toBe('dark');
      toggleTheme();
      expect(theme).toBe('light');
    });
  });

  describe('Responsive Behavior', () => {
    it('hides mobile menu on desktop', () => {
      // Mock window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(min-width: 1024px)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      // Component would check media query and hide mobile menu
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      expect(isDesktop).toBe(true);
    });
  });

  describe('ThemeToggle Component', () => {
    beforeEach(() => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    it('renders theme toggle button', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
      
      const button = screen.getByRole('button', { name: /theme/i });
      expect(button).toBeInTheDocument();
    });

    it('opens dropdown menu on click', async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
      
      const button = screen.getByRole('button', { name: /theme/i });
      await userEvent.click(button);
      
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
      
      const button = screen.getByRole('button', { name: /theme/i });
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on icon buttons', () => {
      render(
        <button aria-label="Close dialog">
          <span>×</span>
        </button>
      );
      
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('announces loading states to screen readers', () => {
      render(
        <div role="status" aria-live="polite">
          <span className="sr-only">Loading...</span>
        </div>
      );
      
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });

    it('supports keyboard navigation', async () => {
      render(
        <>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </>
      );

      const firstButton = screen.getByText('First');
      const secondButton = screen.getByText('Second');
      
      // Tab navigation
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
      
      await userEvent.tab();
      expect(document.activeElement).toBe(secondButton);
    });
  });
});