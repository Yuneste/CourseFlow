'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

// Linear progress bar
interface LinearProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

export function LinearProgress({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
  variant = 'default',
  animated = true
}: LinearProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className={cn('relative', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full',
            variantClasses[variant],
            animated && 'transition-all duration-300 ease-out'
          )}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// Circular progress
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  showLabel = true,
  variant = 'default'
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: 'stroke-primary',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500'
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={variantColors[variant]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Step progress indicator
interface StepProgressProps {
  steps: {
    id: string;
    label: string;
    description?: string;
  }[];
  currentStep: number;
  className?: string;
  variant?: 'dots' | 'numbers' | 'icons';
  orientation?: 'horizontal' | 'vertical';
}

export function StepProgress({
  steps,
  currentStep,
  className,
  variant = 'numbers',
  orientation = 'horizontal'
}: StepProgressProps) {
  const isStepComplete = (index: number) => index < currentStep;
  const isStepActive = (index: number) => index === currentStep;

  return (
    <div
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
        className
      )}
    >
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            'flex items-center',
            orientation === 'vertical' ? 'flex-row mb-8 last:mb-0' : 'flex-col',
            index < steps.length - 1 && orientation === 'horizontal' && 'flex-1'
          )}
        >
          <div className="relative">
            <motion.div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                isStepComplete(index)
                  ? 'bg-primary text-primary-foreground'
                  : isStepActive(index)
                  ? 'bg-primary/20 text-primary border-2 border-primary'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isStepComplete(index) ? (
                <Check className="w-5 h-5" />
              ) : variant === 'numbers' ? (
                index + 1
              ) : variant === 'dots' ? (
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  isStepActive(index) ? 'bg-primary' : 'bg-gray-400'
                )} />
              ) : null}
            </motion.div>
          </div>

          <div className={cn(
            orientation === 'vertical' ? 'ml-4 flex-1' : 'mt-2 text-center'
          )}>
            <p className={cn(
              'font-medium',
              isStepActive(index) ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
            )}>
              {step.label}
            </p>
            {step.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {step.description}
              </p>
            )}
          </div>

          {index < steps.length - 1 && (
            <div
              className={cn(
                orientation === 'vertical'
                  ? 'absolute left-5 top-10 w-0.5 h-8 -translate-x-1/2'
                  : 'flex-1 h-0.5 mx-3',
                isStepComplete(index)
                  ? 'bg-primary'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Infinite loading indicator
interface InfiniteProgressProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'bar' | 'dots' | 'pulse';
}

export function InfiniteProgress({
  className,
  size = 'md',
  variant = 'bar'
}: InfiniteProgressProps) {
  const sizeClasses = {
    sm: variant === 'bar' ? 'h-1' : 'scale-75',
    md: variant === 'bar' ? 'h-2' : 'scale-100',
    lg: variant === 'bar' ? 'h-3' : 'scale-125'
  };

  if (variant === 'bar') {
    return (
      <div className={cn('w-full overflow-hidden', sizeClasses[size], className)}>
        <motion.div
          className="h-full bg-primary"
          animate={{
            x: ['0%', '100%', '0%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{ width: '30%' }}
        />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', sizeClasses[size], className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <motion.div
        className="absolute inset-0 bg-primary/20 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <div className="relative w-8 h-8 bg-primary rounded-full" />
    </div>
  );
}