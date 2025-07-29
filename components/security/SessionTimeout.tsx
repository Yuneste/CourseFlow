'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface SessionTimeoutProps {
  timeoutDuration?: number; // in milliseconds
  warningDuration?: number; // in milliseconds before timeout
  onTimeout: () => void;
  onExtend?: () => void;
  enabled?: boolean;
}

export function SessionTimeout({
  timeoutDuration = 30 * 60 * 1000, // 30 minutes
  warningDuration = 5 * 60 * 1000, // 5 minutes
  onTimeout,
  onExtend,
  enabled = true
}: SessionTimeoutProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setTimeRemaining(0);

    if (!enabled) return;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(warningDuration);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }, timeoutDuration - warningDuration);

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, timeoutDuration);
  }, [enabled, timeoutDuration, warningDuration, onTimeout]);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Only reset if there's been significant time since last activity
    // and warning is not showing (to avoid resetting during countdown)
    if (timeSinceLastActivity > 1000 && !showWarning) {
      resetTimers();
    }
  }, [resetTimers, showWarning]);

  const handleExtend = useCallback(() => {
    resetTimers();
    onExtend?.();
  }, [resetTimers, onExtend]);

  useEffect(() => {
    if (!enabled) return;

    // Throttle the activity handler to improve performance
    let activityThrottleTimeout: NodeJS.Timeout;
    const throttledHandleActivity = () => {
      if (!activityThrottleTimeout) {
        activityThrottleTimeout = setTimeout(() => {
          handleActivity();
          activityThrottleTimeout = undefined as any;
        }, 1000); // Throttle to once per second
      }
    };

    // Activity events to track (reduced for performance)
    const events = ['mousedown', 'keydown', 'click'];

    events.forEach(event => {
      window.addEventListener(event, throttledHandleActivity, { passive: true });
    });

    // Initial timer setup
    resetTimers();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledHandleActivity);
      });
      
      if (activityThrottleTimeout) clearTimeout(activityThrottleTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [enabled, handleActivity, resetTimers]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showWarning} onOpenChange={(open) => !open && handleExtend()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription>
            Your session will expire due to inactivity. Would you like to continue?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <Clock className="h-12 w-12 text-gray-400 mb-4" />
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Time remaining
          </p>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button onClick={onTimeout} variant="outline">
            Sign Out
          </Button>
          <Button onClick={handleExtend}>
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Auto logout countdown component
interface AutoLogoutCountdownProps {
  duration: number; // in seconds
  onLogout: () => void;
  className?: string;
}

export function AutoLogoutCountdown({
  duration,
  onLogout,
  className
}: AutoLogoutCountdownProps) {
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onLogout]);

  const percentage = (countdown / duration) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - percentage / 100)}`}
              className="text-red-500"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 20}` }}
              transition={{ duration, ease: 'linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{countdown}</span>
          </div>
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            Logging out
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            For security reasons
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Session status indicator
interface SessionStatusProps {
  expiresAt?: Date;
  className?: string;
  showRemaining?: boolean;
}

export function SessionStatus({
  expiresAt,
  className,
  showRemaining = true
}: SessionStatusProps) {
  const [remaining, setRemaining] = useState<string>('');

  useEffect(() => {
    if (!expiresAt || !showRemaining) return;

    const updateRemaining = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setRemaining('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setRemaining(`${hours}h ${minutes}m`);
      } else {
        setRemaining(`${minutes}m`);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt, showRemaining]);

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-gray-600 dark:text-gray-400">
        Session active
        {showRemaining && remaining && (
          <span className="ml-1">({remaining} remaining)</span>
        )}
      </span>
    </div>
  );
}