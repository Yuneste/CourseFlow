'use client';

import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#main-navigation', label: 'Skip to navigation' },
  { href: '#search', label: 'Skip to search' },
];

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

export function SkipLinks({ links = defaultLinks, className }: SkipLinksProps) {
  return (
    <div className={cn(
      'sr-only focus-within:not-sr-only',
      'absolute top-0 left-0 z-[100]',
      className
    )}>
      <ul className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 rounded-md shadow-lg">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={cn(
                'block px-4 py-2 text-sm font-medium rounded',
                'text-gray-900 dark:text-gray-100',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset'
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}