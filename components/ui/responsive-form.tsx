'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ResponsiveFormProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}

export function ResponsiveForm({ 
  children, 
  className,
  columns = 1 
}: ResponsiveFormProps) {
  const gridClass = {
    1: '',
    2: 'sm:grid sm:grid-cols-2 sm:gap-6',
    3: 'sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6'
  };

  return (
    <form className={cn('space-y-6', gridClass[columns], className)}>
      {children}
    </form>
  );
}

interface FormFieldWrapperProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function FormFieldWrapper({ 
  children, 
  className,
  fullWidth = false 
}: FormFieldWrapperProps) {
  return (
    <div className={cn(
      'space-y-2',
      fullWidth && 'sm:col-span-full',
      className
    )}>
      {children}
    </div>
  );
}

interface FormActionsProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  stack?: boolean;
}

export function FormActions({ 
  children, 
  className,
  align = 'right',
  stack = false
}: FormActionsProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={cn(
      'flex gap-3 pt-6',
      stack ? 'flex-col sm:flex-row' : 'flex-row',
      alignmentClasses[align],
      'sm:col-span-full',
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-friendly input wrapper
interface MobileInputProps {
  children: ReactNode;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function MobileInput({
  children,
  label,
  error,
  hint,
  required,
  className
}: MobileInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {children}
      </div>
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

// Responsive modal/dialog wrapper
interface ResponsiveDialogProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4'
};

export function ResponsiveDialog({
  children,
  className,
  size = 'md'
}: ResponsiveDialogProps) {
  return (
    <div className={cn(
      'w-full',
      sizeClasses[size],
      'max-h-[90vh] overflow-y-auto',
      className
    )}>
      {children}
    </div>
  );
}