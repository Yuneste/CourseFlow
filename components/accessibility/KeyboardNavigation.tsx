'use client';

import { useEffect, useCallback, RefObject } from 'react';

// Hook for keyboard navigation
interface UseKeyboardNavigationProps {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onSpace?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  ref?: RefObject<HTMLElement>;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onEscape,
  onSpace,
  onHome,
  onEnd,
  ref,
  enabled = true
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const keyHandlers: Record<string, (() => void) | undefined> = {
      'ArrowUp': onArrowUp,
      'ArrowDown': onArrowDown,
      'ArrowLeft': onArrowLeft,
      'ArrowRight': onArrowRight,
      'Enter': onEnter,
      'Escape': onEscape,
      ' ': onSpace,
      'Home': onHome,
      'End': onEnd,
    };

    const handler = keyHandlers[e.key];
    if (handler) {
      e.preventDefault();
      handler();
    }
  }, [enabled, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onSpace, onHome, onEnd]);

  useEffect(() => {
    const element = ref?.current || document;
    
    if (element) {
      (element as any).addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (element) {
        (element as any).removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [handleKeyDown, ref]);
}

// Hook for roving tabindex pattern
interface UseRovingTabIndexProps {
  items: RefObject<HTMLElement>[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  orientation?: 'horizontal' | 'vertical' | 'grid';
  loop?: boolean;
  enabled?: boolean;
}

export function useRovingTabIndex({
  items,
  activeIndex,
  onActiveIndexChange,
  orientation = 'horizontal',
  loop = true,
  enabled = true
}: UseRovingTabIndexProps) {
  const handleKeyNavigation = useCallback((direction: 'prev' | 'next' | 'first' | 'last') => {
    if (!enabled) return;

    let newIndex = activeIndex;

    switch (direction) {
      case 'prev':
        newIndex = activeIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
        break;
      case 'next':
        newIndex = activeIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = items.length - 1;
        break;
    }

    onActiveIndexChange(newIndex);
    items[newIndex]?.current?.focus();
  }, [activeIndex, items, loop, onActiveIndexChange, enabled]);

  useKeyboardNavigation({
    onArrowUp: orientation === 'vertical' ? () => handleKeyNavigation('prev') : undefined,
    onArrowDown: orientation === 'vertical' ? () => handleKeyNavigation('next') : undefined,
    onArrowLeft: orientation === 'horizontal' ? () => handleKeyNavigation('prev') : undefined,
    onArrowRight: orientation === 'horizontal' ? () => handleKeyNavigation('next') : undefined,
    onHome: () => handleKeyNavigation('first'),
    onEnd: () => handleKeyNavigation('last'),
    enabled
  });

  // Update tabindex on items
  useEffect(() => {
    items.forEach((item, index) => {
      if (item.current) {
        item.current.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [items, activeIndex]);
}

// Keyboard shortcuts display component
interface KeyboardShortcut {
  keys: string[];
  description: string;
  category?: string;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  className?: string;
}

export function KeyboardShortcuts({ shortcuts, className }: KeyboardShortcutsProps) {
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h2>
      {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {category}
          </h3>
          <div className="space-y-2">
            {categoryShortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <kbd
                      key={keyIndex}
                      className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}