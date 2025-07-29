import { useState, useCallback } from 'react';
import { logger } from '@/lib/services/logger.service';
import { ERROR_MESSAGES } from '@/lib/constants';

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  throwOnError?: boolean;
}

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for handling async operations with consistent loading and error states
 * Provides automatic error logging and optional success/error callbacks
 */
export function useAsyncOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await operation(...args);
        
        setState({ data: result, loading: false, error: null });
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        if (options.successMessage) {
          logger.info(options.successMessage, {
            action: 'asyncOperation',
            metadata: { result }
          });
        }
        
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        setState({ data: null, loading: false, error: errorObj });
        
        // Log the error
        logger.error(
          options.errorMessage || ERROR_MESSAGES.GENERIC,
          errorObj,
          {
            action: 'asyncOperation',
            metadata: { operation: operation.name, args }
          }
        );
        
        if (options.onError) {
          options.onError(errorObj);
        }
        
        if (options.throwOnError) {
          throw errorObj;
        }
        
        return null;
      }
    },
    [operation, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.data && !state.error,
    isSuccess: !state.loading && !!state.data && !state.error,
    isError: !state.loading && !!state.error,
  };
}

/**
 * Type-safe version of useAsyncOperation for specific return types
 */
export function useTypedAsyncOperation<T, Args extends any[] = any[]>(
  operation: (...args: Args) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  return useAsyncOperation<T>(operation, options) as {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: (...args: Args) => Promise<T | null>;
    reset: () => void;
    isIdle: boolean;
    isSuccess: boolean;
    isError: boolean;
  };
}