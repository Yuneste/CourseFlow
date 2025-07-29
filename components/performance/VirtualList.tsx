'use client';

import { useRef, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 3,
  className,
  onScroll,
  getItemKey = (_, index) => index
}: VirtualListProps<T>) {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate item positions with memoization
  const getItemHeight = useCallback(
    (index: number) => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight]
  );

  // Memoize item offsets to avoid recalculation
  const itemOffsets = useMemo(() => {
    const offsets: number[] = [];
    let offset = 0;
    for (let i = 0; i < items.length; i++) {
      offsets[i] = offset;
      offset += getItemHeight(i);
    }
    return offsets;
  }, [items.length, getItemHeight]);

  const getItemOffset = useCallback(
    (index: number) => itemOffsets[index] || 0,
    [itemOffsets]
  );

  const getTotalHeight = useMemo(() => {
    if (items.length === 0) return 0;
    return itemOffsets[items.length - 1] + getItemHeight(items.length - 1);
  }, [items.length, itemOffsets, getItemHeight]);

  // Calculate visible range
  const getVisibleRange = useCallback(() => {
    const start = scrollTop;
    const end = scrollTop + height;

    let startIndex = 0;
    let endIndex = items.length - 1;

    // Binary search for start index
    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const offset = getItemOffset(mid);
      if (offset < start) {
        low = mid + 1;
      } else {
        high = mid - 1;
        startIndex = mid;
      }
    }

    // Find end index
    for (let i = startIndex; i < items.length; i++) {
      const offset = getItemOffset(i);
      if (offset > end) {
        endIndex = i;
        break;
      }
    }

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex: Math.min(items.length - 1, endIndex + overscan)
    };
  }, [scrollTop, height, items.length, getItemOffset, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);
    onScroll?.(newScrollTop);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [onScroll]);

  const { startIndex, endIndex } = getVisibleRange();
  const totalHeight = getTotalHeight;
  const offsetY = getItemOffset(startIndex);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {items.slice(startIndex, endIndex + 1).map((item, index) => {
            const actualIndex = startIndex + index;
            const key = getItemKey(item, actualIndex);
            const itemHeight = getItemHeight(actualIndex);
            
            return (
              <div
                key={key}
                style={{ height: itemHeight }}
                className={cn(
                  'transition-opacity duration-200',
                  isScrolling && 'opacity-80'
                )}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Hook for window-based virtual scrolling
interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number;
}

export function useVirtualScroll({
  itemHeight,
  containerHeight,
  totalItems,
  overscan = 3
}: UseVirtualScrollOptions) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    startIndex + visibleCount + overscan * 2
  );

  const offsetY = startIndex * itemHeight;
  const totalHeight = totalItems * itemHeight;

  return {
    virtualItems: {
      startIndex,
      endIndex,
      offsetY,
      totalHeight
    },
    scrollTo: (index: number) => {
      setScrollTop(index * itemHeight);
    },
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
}