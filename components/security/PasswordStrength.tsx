'use client';

import { useState, useEffect } from 'react';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
  onStrengthChange?: (strength: number) => void;
  className?: string;
}

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
  onStrengthChange,
  className
}: PasswordStrengthMeterProps) {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { label: 'At least 8 characters', regex: /.{8,}/, met: false },
    { label: 'Contains uppercase letter', regex: /[A-Z]/, met: false },
    { label: 'Contains lowercase letter', regex: /[a-z]/, met: false },
    { label: 'Contains a number', regex: /[0-9]/, met: false },
    { label: 'Contains special character', regex: /[^A-Za-z0-9]/, met: false }
  ]);

  const [strength, setStrength] = useState(0);

  useEffect(() => {
    const updatedRequirements = requirements.map(req => ({
      ...req,
      met: req.regex.test(password)
    }));
    
    setRequirements(updatedRequirements);
    
    const metCount = updatedRequirements.filter(req => req.met).length;
    const calculatedStrength = (metCount / requirements.length) * 100;
    setStrength(calculatedStrength);
    
    onStrengthChange?.(calculatedStrength);
  }, [password, requirements.length, onStrengthChange]);

  const getStrengthLabel = () => {
    if (strength === 0) return 'Too weak';
    if (strength <= 20) return 'Very weak';
    if (strength <= 40) return 'Weak';
    if (strength <= 60) return 'Fair';
    if (strength <= 80) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Password strength</span>
          <span className={cn(
            'font-medium',
            strength <= 40 && 'text-red-600',
            strength > 40 && strength <= 60 && 'text-yellow-600',
            strength > 60 && 'text-green-600'
          )}>
            {getStrengthLabel()}
          </span>
        </div>
        
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((bar) => (
            <div
              key={bar}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                bar <= Math.ceil(strength / 20)
                  ? getStrengthColor()
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          ))}
        </div>
      </div>

      {showRequirements && password.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {requirements.map((req, index) => (
              <motion.div
                key={req.label}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-2 text-sm',
                  req.met ? 'text-green-600' : 'text-gray-400'
                )}
              >
                {req.met ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <span>{req.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// Password input with visibility toggle
interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showStrength?: boolean;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = 'Enter password',
  className,
  showStrength = false,
  autoComplete = 'new-password',
  required,
  disabled
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn('pr-10', className)}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>
      
      {showStrength && value && (
        <PasswordStrengthMeter password={value} />
      )}
    </div>
  );
}

// Password generator
interface GeneratedPassword {
  password: string;
  strength: number;
}

interface PasswordGeneratorProps {
  onGenerate: (password: GeneratedPassword) => void;
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  className?: string;
}

export function PasswordGenerator({
  onGenerate,
  length = 16,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true,
  className
}: PasswordGeneratorProps) {
  const generatePassword = () => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Calculate strength (simplified)
    const strength = Math.min(100, (password.length / 20) * 100);

    onGenerate({ password, strength });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={generatePassword}
      className={className}
    >
      Generate Password
    </Button>
  );
}

// Password confirmation input
interface PasswordConfirmationProps {
  password: string;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  className?: string;
}

export function PasswordConfirmation({
  password,
  confirmPassword,
  onConfirmPasswordChange,
  className
}: PasswordConfirmationProps) {
  const [touched, setTouched] = useState(false);
  const passwordsMatch = password === confirmPassword;
  const showError = touched && confirmPassword && !passwordsMatch;
  const showSuccess = touched && confirmPassword && passwordsMatch;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Confirm password"
          className={cn(
            'pr-10',
            showError && 'border-red-500 focus:ring-red-500',
            showSuccess && 'border-green-500 focus:ring-green-500'
          )}
        />
        {(showError || showSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {showError ? (
              <X className="h-4 w-4 text-red-500" />
            ) : (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {showError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-red-600"
          >
            Passwords do not match
          </motion.p>
        )}
        {showSuccess && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-green-600"
          >
            Passwords match
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}