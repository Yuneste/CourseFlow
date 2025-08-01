/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Debounce with promise support
 */
export function debouncePromise<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;
  let resolvePromise: ((value: any) => void) | null = null;
  let rejectPromise: ((reason: any) => void) | null = null;

  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      const later = async () => {
        timeout = null;
        try {
          const result = await func(...args);
          if (resolvePromise) resolvePromise(result);
        } catch (error) {
          if (rejectPromise) rejectPromise(error);
        }
      };

      if (timeout) {
        clearTimeout(timeout);
      }

      resolvePromise = resolve;
      rejectPromise = reject;
      timeout = setTimeout(later, wait);
    });
  };
}