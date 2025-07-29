import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen } from 'lucide-react';

describe('EmptyState', () => {
  const defaultProps = {
    icon: BookOpen,
    title: 'No courses found',
    description: 'Start by adding your first course',
  };

  it('renders with required props', () => {
    render(<EmptyState {...defaultProps} />);
    
    expect(screen.getByText('No courses found')).toBeInTheDocument();
    expect(screen.getByText('Start by adding your first course')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<EmptyState icon={BookOpen} title="No courses found" />);
    
    expect(screen.getByText('No courses found')).toBeInTheDocument();
    expect(screen.queryByText('Start by adding your first course')).not.toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const handleClick = vi.fn();
    
    render(
      <EmptyState
        {...defaultProps}
        action={{
          label: 'Add Course',
          onClick: handleClick,
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add Course' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<EmptyState {...defaultProps} size="sm" />);
    expect(screen.getByText('No courses found')).toHaveClass('text-lg');
    
    rerender(<EmptyState {...defaultProps} size="lg" />);
    expect(screen.getByText('No courses found')).toHaveClass('text-2xl');
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders action button with correct variant', () => {
    render(
      <EmptyState
        {...defaultProps}
        action={{
          label: 'Add Course',
          onClick: vi.fn(),
          variant: 'outline',
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add Course' });
    expect(button).toHaveClass('variant-outline');
  });
});