'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

// Network status indicator component
interface NetworkStatusIndicatorProps {
  position?: 'top' | 'bottom';
  showWhenOnline?: boolean;
  className?: string;
}

export function NetworkStatusIndicator({
  position = 'bottom',
  showWhenOnline = false,
  className
}: NetworkStatusIndicatorProps) {
  const { isOnline, wasOffline } = useNetworkStatus();
  const showIndicator = !isOnline || (wasOffline && isOnline && showWhenOnline);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          className={cn(
            'fixed left-0 right-0 z-50 pointer-events-none',
            position === 'top' ? 'top-0' : 'bottom-0',
            className
          )}
          initial={{ y: position === 'top' ? -100 : 100 }}
          animate={{ y: 0 }}
          exit={{ y: position === 'top' ? -100 : 100 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div
            className={cn(
              'flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium',
              isOnline
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            )}
          >
            {isOnline ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Back online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span>You are offline</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Connection quality indicator
interface ConnectionQualityProps {
  className?: string;
  showLabel?: boolean;
}

export function ConnectionQuality({
  className,
  showLabel = true
}: ConnectionQualityProps) {
  const [quality, setQuality] = useState<'good' | 'fair' | 'poor' | 'offline'>('good');
  const [rtt, setRtt] = useState<number>(0);

  useEffect(() => {
    if (!navigator.onLine) {
      setQuality('offline');
      return;
    }

    // @ts-ignore - navigator.connection is not in TypeScript types
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const updateConnectionQuality = () => {
        const effectiveType = connection.effectiveType;
        const rtt = connection.rtt;
        
        setRtt(rtt || 0);
        
        if (effectiveType === '4g' && rtt < 100) {
          setQuality('good');
        } else if (effectiveType === '3g' || (effectiveType === '4g' && rtt < 300)) {
          setQuality('fair');
        } else {
          setQuality('poor');
        }
      };

      updateConnectionQuality();
      connection.addEventListener('change', updateConnectionQuality);

      return () => {
        connection.removeEventListener('change', updateConnectionQuality);
      };
    }
  }, []);

  const qualityConfig = {
    good: {
      color: 'text-green-500',
      bars: 3,
      label: 'Good connection'
    },
    fair: {
      color: 'text-yellow-500',
      bars: 2,
      label: 'Fair connection'
    },
    poor: {
      color: 'text-red-500',
      bars: 1,
      label: 'Poor connection'
    },
    offline: {
      color: 'text-gray-400',
      bars: 0,
      label: 'Offline'
    }
  };

  const config = qualityConfig[quality];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-end gap-0.5">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={cn(
              'w-1 bg-gray-300 dark:bg-gray-600 rounded-full transition-all',
              bar <= config.bars && config.color,
              bar === 1 && 'h-2',
              bar === 2 && 'h-3',
              bar === 3 && 'h-4'
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {config.label}
          {rtt > 0 && ` (${rtt}ms)`}
        </span>
      )}
    </div>
  );
}

// Offline mode banner
interface OfflineBannerProps {
  onRetry?: () => void;
  className?: string;
}

export function OfflineBanner({
  onRetry,
  className
}: OfflineBannerProps) {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      className={cn(
        'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4',
        className
      )}
    >
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            You&apos;re currently offline
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Some features may be limited. Your changes will be synced when you&apos;re back online.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:underline mt-2"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Auto-retry component for failed requests
interface AutoRetryProps {
  onRetry: () => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
  children: (props: {
    retrying: boolean;
    retryCount: number;
    retry: () => void;
  }) => React.ReactNode;
}

export function AutoRetry({
  onRetry,
  maxRetries = 3,
  retryDelay = 1000,
  children
}: AutoRetryProps) {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOnline && retryCount > 0 && retryCount < maxRetries) {
      timeoutId = setTimeout(async () => {
        setRetrying(true);
        try {
          await onRetry();
          setRetryCount(0);
        } catch {
          setRetryCount(prev => prev + 1);
        } finally {
          setRetrying(false);
        }
      }, retryDelay * Math.pow(2, retryCount - 1)); // Exponential backoff
    }

    return () => clearTimeout(timeoutId);
  }, [isOnline, retryCount, maxRetries, retryDelay, onRetry]);

  const retry = async () => {
    setRetrying(true);
    setRetryCount(prev => prev + 1);
    try {
      await onRetry();
      setRetryCount(0);
    } catch {
      // Error handled by effect
    } finally {
      setRetrying(false);
    }
  };

  return <>{children({ retrying, retryCount, retry })}</>;
}