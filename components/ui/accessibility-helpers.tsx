import React from 'react';

// Screen reader only text for accessibility
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Icon button with proper accessibility
interface AccessibleIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
}

export function AccessibleIconButton({ 
  label, 
  icon, 
  className,
  ...props 
}: AccessibleIconButtonProps) {
  return (
    <button
      aria-label={label}
      className={className}
      {...props}
    >
      {icon}
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </button>
  );
}

// Skip to main content link for keyboard navigation
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

// Announce dynamic content changes to screen readers
export function LiveRegion({ 
  children, 
  mode = 'polite' 
}: { 
  children: React.ReactNode;
  mode?: 'polite' | 'assertive';
}) {
  return (
    <div
      role="status"
      aria-live={mode}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}

// Loading state with proper announcement
export function AccessibleLoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <>
      <LiveRegion mode="polite">{message}</LiveRegion>
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <ScreenReaderOnly>{message}</ScreenReaderOnly>
      </div>
    </>
  );
}

// Form field with proper labeling
interface AccessibleFormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement;
}

export function AccessibleFormField({ 
  label, 
  error, 
  required,
  children 
}: AccessibleFormFieldProps) {
  const id = React.useId();
  const errorId = `${id}-error`;
  
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </label>
      {React.cloneElement(children, {
        id,
        'aria-invalid': !!error,
        'aria-describedby': error ? errorId : undefined,
        'aria-required': required,
      })}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}