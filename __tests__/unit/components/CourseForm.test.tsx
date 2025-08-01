import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseForm } from '@/components/features/courses/CourseForm';
import '@testing-library/jest-dom';

const mockAcademicSystem = {
  terms: ['Fall 2024', 'Spring 2025', 'Summer 2025'],
  periodType: 'semester' as const,
  creditSystem: 'credits',
};

describe('CourseForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with all fields', () => {
    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        academicSystem={mockAcademicSystem}
      />
    );

    expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/term/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/course code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/professor/i)).toBeInTheDocument();
    expect(screen.getByText(/color/i)).toBeInTheDocument();
    expect(screen.getByText(/emoji/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/credits/i)).toBeInTheDocument();
  });

  it('should show "Add New Course" title when creating', () => {
    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        academicSystem={mockAcademicSystem}
      />
    );

    expect(screen.getByText('Add New Course')).toBeInTheDocument();
  });

  it('should show "Edit Course" title when editing', () => {
    const mockCourse = {
      id: '1',
      user_id: 'user123',
      name: 'Test Course',
      term: 'Fall 2024',
      academic_period_type: 'semester' as const,
      color: '#3B82F6',
      created_at: new Date(),
      updated_at: new Date(),
    };

    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        course={mockCourse}
        academicSystem={mockAcademicSystem}
      />
    );

    expect(screen.getByText('Edit Course')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        academicSystem={mockAcademicSystem}
      />
    );

    const submitButton = screen.getByText(/add course/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/course name must be at least 2 characters/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate field lengths', async () => {
    const user = userEvent.setup();
    
    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        academicSystem={mockAcademicSystem}
      />
    );

    const nameInput = screen.getByLabelText(/course name/i);
    const codeInput = screen.getByLabelText(/course code/i);
    
    // Test name too short
    await user.type(nameInput, 'A');
    const submitButton = screen.getByText(/add course/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/course name must be at least 2 characters/i)).toBeInTheDocument();
    });

    // Test code too long
    await user.clear(nameInput);
    await user.type(nameInput, 'Valid Course Name');
    await user.type(codeInput, 'A'.repeat(21));
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/course code must be 20 characters or less/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        academicSystem={mockAcademicSystem}
      />
    );

    const nameInput = screen.getByLabelText(/course name/i);
    const codeInput = screen.getByLabelText(/course code/i);
    const professorInput = screen.getByLabelText(/professor/i);
    
    await user.type(nameInput, 'Introduction to Computer Science');
    await user.type(codeInput, 'CS101');
    await user.type(professorInput, 'Dr. Smith');
    
    const submitButton = screen.getByText(/add course/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Introduction to Computer Science',
        term: 'Fall 2024',
        code: 'CS101',
        professor: 'Dr. Smith',
        academic_period_type: 'semester',
        credits: undefined,
        ects_credits: undefined,
        color: '#3B82F6',
        emoji: '📚',
      });
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should populate form fields when editing', () => {
    const mockCourse = {
      id: '1',
      user_id: 'user123',
      name: 'Existing Course',
      code: 'EXIST101',
      professor: 'Dr. Existing',
      term: 'Spring 2025',
      academic_period_type: 'semester' as const,
      credits: 3,
      color: '#10B981',
      emoji: '📖',
      created_at: new Date(),
      updated_at: new Date(),
    };

    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        course={mockCourse}
        academicSystem={mockAcademicSystem}
      />
    );

    expect(screen.getByDisplayValue('Existing Course')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EXIST101')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dr. Existing')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Spring 2025')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('should handle color selection', async () => {
    const user = userEvent.setup();
    
    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        academicSystem={mockAcademicSystem}
      />
    );

    const greenColorButton = screen.getByLabelText(/select color #10B981/i);
    await user.click(greenColorButton);

    // Fill required fields
    const nameInput = screen.getByLabelText(/course name/i);
    await user.type(nameInput, 'Test Course');

    const submitButton = screen.getByText(/add course/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          color: '#10B981',
        })
      );
    });
  });

  it('should handle emoji selection', async () => {
    const user = userEvent.setup();
    
    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        academicSystem={mockAcademicSystem}
      />
    );

    const emojiButton = screen.getByText('📖');
    await user.click(emojiButton);

    // Fill required fields
    const nameInput = screen.getByLabelText(/course name/i);
    await user.type(nameInput, 'Test Course');

    const submitButton = screen.getByText(/add course/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          emoji: '📖',
        })
      );
    });
  });

  it('should close form on cancel', async () => {
    const user = userEvent.setup();
    
    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        academicSystem={mockAcademicSystem}
      />
    );

    const cancelButton = screen.getByText(/cancel/i);
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show ECTS credits field for ECTS credit system', () => {
    const ectsAcademicSystem = {
      ...mockAcademicSystem,
      creditSystem: 'ects',
    };

    render(
      <CourseForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        academicSystem={ectsAcademicSystem}
      />
    );

    expect(screen.getByLabelText(/ects credits/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^credits$/i)).not.toBeInTheDocument();
  });
});