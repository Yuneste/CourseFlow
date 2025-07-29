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
 * 
 * @template T - The expected return type of the async operation
 * 
 * @param operation - Async function to execute
 * @param options - Configuration options
 * @param options.onSuccess - Callback executed on successful operation
 * @param options.onError - Callback executed on operation error
 * @param options.successMessage - Message to log on success
 * @param options.errorMessage - Custom error message (defaults to generic)
 * @param options.throwOnError - Whether to rethrow errors after handling
 * 
 * @returns Object containing:
 *   - data: T | null - Result data when successful
 *   - loading: boolean - Loading state indicator
 *   - error: Error | null - Error object if operation failed
 *   - execute: Function - Trigger the async operation
 *   - reset: Function - Reset state to initial values
 *   - isIdle: boolean - True when no operation has been executed
 *   - isSuccess: boolean - True when operation completed successfully
 *   - isError: boolean - True when operation failed
 * 
 * @example
 * const { data, loading, error, execute } = useAsyncOperation(
 *   async (id: string) => fetchUser(id),
 *   {
 *     onSuccess: (user) => toast.success('User loaded'),
 *     onError: (error) => toast.error(error.message),
 *     errorMessage: 'Failed to load user'
 *   }
 * );
 * 
 * // Execute the operation
 * await execute('user123');
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