'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  error: Error | null;
}

interface UseOptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, previousData: T) => void;
  showToast?: boolean;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  options: UseOptimisticUpdateOptions<T> = {}
) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    error: null
  });

  const previousDataRef = useRef<T>(initialData);

  const updateOptimistically = useCallback(
    async (
      optimisticData: T | ((prev: T) => T),
      asyncUpdate: () => Promise<T>
    ) => {
      // Store previous data for rollback
      previousDataRef.current = state.data;

      // Apply optimistic update
      const newData = typeof optimisticData === 'function'
        ? (optimisticData as (prev: T) => T)(state.data)
        : optimisticData;

      setState({
        data: newData,
        isOptimistic: true,
        error: null
      });

      try {
        // Perform async update
        const result = await asyncUpdate();
        
        // Update with server response
        setState({
          data: result,
          isOptimistic: false,
          error: null
        });

        options.onSuccess?.(result);
        
        if (options.showToast) {
          toast.success('Updated successfully');
        }

        return result;
      } catch (error) {
        // Rollback on error
        const err = error as Error;
        
        setState({
          data: previousDataRef.current,
          isOptimistic: false,
          error: err
        });

        options.onError?.(err, previousDataRef.current);
        
        if (options.showToast) {
          toast.error('Update failed. Changes reverted.');
        }

        throw error;
      }
    },
    [state.data, options]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isOptimistic: false,
      error: null
    });
  }, [initialData]);

  return {
    data: state.data,
    isOptimistic: state.isOptimistic,
    error: state.error,
    updateOptimistically,
    reset
  };
}

// Optimistic list operations
interface UseOptimisticListOptions<T> extends UseOptimisticUpdateOptions<T[]> {
  getItemId: (item: T) => string | number;
}

export function useOptimisticList<T>(
  initialItems: T[],
  options: UseOptimisticListOptions<T>
) {
  const { getItemId, ...updateOptions } = options;
  
  const {
    data: items,
    isOptimistic,
    error,
    updateOptimistically,
    reset
  } = useOptimisticUpdate(initialItems, updateOptions);

  const addItem = useCallback(
    (item: T, asyncAdd: () => Promise<T[]>) => {
      return updateOptimistically(
        (prev) => [...prev, item],
        asyncAdd
      );
    },
    [updateOptimistically]
  );

  const updateItem = useCallback(
    (id: string | number, updates: Partial<T>, asyncUpdate: () => Promise<T[]>) => {
      return updateOptimistically(
        (prev) => prev.map(item => 
          getItemId(item) === id ? { ...item, ...updates } : item
        ),
        asyncUpdate
      );
    },
    [updateOptimistically, getItemId]
  );

  const removeItem = useCallback(
    (id: string | number, asyncRemove: () => Promise<T[]>) => {
      return updateOptimistically(
        (prev) => prev.filter(item => getItemId(item) !== id),
        asyncRemove
      );
    },
    [updateOptimistically, getItemId]
  );

  const reorderItems = useCallback(
    (fromIndex: number, toIndex: number, asyncReorder: () => Promise<T[]>) => {
      return updateOptimistically(
        (prev) => {
          const newItems = [...prev];
          const [removed] = newItems.splice(fromIndex, 1);
          newItems.splice(toIndex, 0, removed);
          return newItems;
        },
        asyncReorder
      );
    },
    [updateOptimistically]
  );

  return {
    items,
    isOptimistic,
    error,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    reset
  };
}

// Optimistic form component
interface OptimisticFormProps<T> {
  initialData: T;
  onSubmit: (data: T) => Promise<T>;
  children: (props: {
    data: T;
    isSubmitting: boolean;
    handleChange: (field: keyof T, value: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
  }) => React.ReactNode;
  showToast?: boolean;
}

export function OptimisticForm<T extends Record<string, any>>({
  initialData,
  onSubmit,
  children,
  showToast = true
}: OptimisticFormProps<T>) {
  const {
    data,
    isOptimistic,
    updateOptimistically
  } = useOptimisticUpdate(initialData, { showToast });

  const [localData, setLocalData] = useState(data);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateOptimistically(
        localData,
        () => onSubmit(localData)
      );
    } catch (error) {
      // Error is handled by updateOptimistically
    }
  }, [localData, updateOptimistically, onSubmit]);

  return (
    <>
      {children({
        data: localData,
        isSubmitting: isOptimistic,
        handleChange,
        handleSubmit
      })}
    </>
  );
}