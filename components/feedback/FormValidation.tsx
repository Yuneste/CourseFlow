'use client';

import { ReactNode, useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Validation message component
interface ValidationMessageProps {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  className?: string;
  show?: boolean;
}

export function ValidationMessage({
  message,
  type,
  className,
  show = true
}: ValidationMessageProps) {
  const icons = {
    error: <XCircle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />
  };

  const styles = {
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'flex items-center gap-1.5 text-sm mt-1',
            styles[type],
            className
          )}
        >
          {icons[type]}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Field validation wrapper
interface FieldValidationProps {
  children: ReactNode;
  error?: string;
  success?: string;
  warning?: string;
  touched?: boolean;
  showValidation?: 'always' | 'touched' | 'error';
  className?: string;
}

export function FieldValidation({
  children,
  error,
  success,
  warning,
  touched = false,
  showValidation = 'touched',
  className
}: FieldValidationProps) {
  const shouldShowValidation = 
    showValidation === 'always' ||
    (showValidation === 'touched' && touched) ||
    (showValidation === 'error' && error);

  return (
    <div className={cn('space-y-1', className)}>
      {children}
      {shouldShowValidation && (
        <>
          {error && <ValidationMessage message={error} type="error" />}
          {!error && success && <ValidationMessage message={success} type="success" />}
          {!error && warning && <ValidationMessage message={warning} type="warning" />}
        </>
      )}
    </div>
  );
}

// Real-time validation hook
interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

interface UseFieldValidationOptions<T> {
  rules?: ValidationRule<T>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export function useFieldValidation<T>(
  initialValue: T,
  options: UseFieldValidationOptions<T> = {}
) {
  const {
    rules = [],
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!validateOnChange || !touched) return;

    const timer = setTimeout(() => {
      setIsValidating(true);
      const failedRule = rules.find(rule => !rule.validate(value));
      setError(failedRule ? failedRule.message : '');
      setIsValidating(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, rules, validateOnChange, touched, debounceMs]);

  const handleChange = (newValue: T) => {
    setValue(newValue);
    if (!touched) setTouched(true);
  };

  const handleBlur = () => {
    setTouched(true);
    if (validateOnBlur) {
      const failedRule = rules.find(rule => !rule.validate(value));
      setError(failedRule ? failedRule.message : '');
    }
  };

  const validate = () => {
    const failedRule = rules.find(rule => !rule.validate(value));
    const hasError = !!failedRule;
    setError(failedRule ? failedRule.message : '');
    setTouched(true);
    return !hasError;
  };

  const reset = () => {
    setValue(initialValue);
    setError('');
    setTouched(false);
    setIsValidating(false);
  };

  return {
    value,
    error,
    touched,
    isValidating,
    isValid: !error && touched,
    handleChange,
    handleBlur,
    validate,
    reset
  };
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule<any> => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value != null;
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length <= max,
    message: message || `Must be no more than ${max} characters`
  }),

  email: (message = 'Please enter a valid email'): ValidationRule<string> => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value >= min,
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value <= max,
    message: message || `Must be no more than ${max}`
  })
};

// Password strength indicator
interface PasswordStrengthProps {
  password: string;
  className?: string;
  showLabel?: boolean;
}

export function PasswordStrength({
  password,
  className,
  showLabel = true
}: PasswordStrengthProps) {
  const calculateStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = calculateStrength(password);
  const percentage = (strength / 5) * 100;

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              index < strength
                ? strengthColors[strength - 1]
                : 'bg-gray-200 dark:bg-gray-700'
            )}
          />
        ))}
      </div>
      {showLabel && password.length > 0 && (
        <p className={cn(
          'text-xs font-medium',
          strength === 0 && 'text-red-600',
          strength === 1 && 'text-orange-600',
          strength === 2 && 'text-yellow-600',
          strength === 3 && 'text-blue-600',
          strength === 4 && 'text-green-600'
        )}>
          {strengthLabels[strength] || 'Very Weak'}
        </p>
      )}
    </div>
  );
}