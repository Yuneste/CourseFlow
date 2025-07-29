'use client';

import React, { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleWrapperProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaHidden?: boolean;
  ariaLive?: 'off' | 'polite' | 'assertive';
  tabIndex?: number;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  focusable?: boolean;
  interactive?: boolean;
}

export const AccessibleWrapper = forwardRef<any, AccessibleWrapperProps>(
  function AccessibleWrapper({
    children,
    as: Component = 'div',
    role,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    ariaExpanded,
    ariaHidden,
    ariaLive,
    tabIndex,
    className,
    onClick,
    onKeyDown,
    focusable = false,
    interactive = false,
    ...props
  }, ref) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (interactive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.();
      }
      onKeyDown?.(e);
    };

    const componentProps = {
      ref,
      role,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      'aria-expanded': ariaExpanded,
      'aria-hidden': ariaHidden,
      'aria-live': ariaLive,
      tabIndex: focusable || interactive ? (tabIndex ?? 0) : tabIndex,
      className: cn(
        interactive && 'cursor-pointer',
        focusable && 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      ),
      onClick: interactive ? onClick : undefined,
      onKeyDown: interactive ? handleKeyDown : onKeyDown,
      ...props
    };

    return React.createElement(
      Component,
      componentProps,
      children
    );
  }
);

// Accessible heading component
interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function AccessibleHeading({ 
  level, 
  children, 
  className,
  id 
}: AccessibleHeadingProps) {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <HeadingTag 
      id={id}
      className={cn(
        // Ensure proper heading hierarchy styles
        level === 1 && 'text-3xl font-bold',
        level === 2 && 'text-2xl font-semibold',
        level === 3 && 'text-xl font-semibold',
        level === 4 && 'text-lg font-medium',
        level === 5 && 'text-base font-medium',
        level === 6 && 'text-sm font-medium',
        className
      )}
    >
      {children}
    </HeadingTag>
  );
}

// Accessible button component with proper ARIA attributes
interface AccessibleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaPressed?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  ariaPressed,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className
}: AccessibleButtonProps) {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-busy={loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

// Accessible form field component
interface AccessibleFormFieldProps {
  children: ReactNode;
  label: string;
  id: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function AccessibleFormField({
  children,
  label,
  id,
  error,
  hint,
  required = false,
  className
}: AccessibleFormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      <div className="relative">
        {children}
      </div>
      
      {hint && (
        <p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
      
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}