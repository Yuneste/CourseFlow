'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Card } from './card';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="w-full">{children}</table>
    </div>
  );
}

// Mobile card view for table data
interface MobileTableCardProps {
  data: Record<string, any>[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, item: any) => ReactNode;
    className?: string;
    hideOnMobile?: boolean;
  }[];
  onRowClick?: (item: any) => void;
  className?: string;
}

export function MobileTableCard({
  data,
  columns,
  onRowClick,
  className
}: MobileTableCardProps) {
  return (
    <div className={cn('space-y-3 lg:hidden', className)}>
      {data.map((item, index) => (
        <Card
          key={index}
          className={cn(
            'p-4',
            onRowClick && 'cursor-pointer hover:shadow-lg transition-shadow'
          )}
          onClick={() => onRowClick?.(item)}
        >
          <div className="space-y-2">
            {columns
              .filter(col => !col.hideOnMobile)
              .map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {column.label}
                  </span>
                  <span className={cn('text-sm text-right', column.className)}>
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// Responsive data table component
interface ResponsiveDataTableProps {
  data: Record<string, any>[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, item: any) => ReactNode;
    className?: string;
    hideOnMobile?: boolean;
    width?: string;
  }[];
  onRowClick?: (item: any) => void;
  className?: string;
}

export function ResponsiveDataTable({
  data,
  columns,
  onRowClick,
  className
}: ResponsiveDataTableProps) {
  return (
    <>
      {/* Desktop table view */}
      <div className={cn('hidden lg:block', className)}>
        <ResponsiveTable>
          <thead className="border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-left p-4 font-medium text-gray-700 dark:text-gray-300',
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className={cn(
                  'border-b hover:bg-gray-50 dark:hover:bg-gray-800',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('p-4', column.className)}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      </div>

      {/* Mobile card view */}
      <MobileTableCard
        data={data}
        columns={columns}
        onRowClick={onRowClick}
        className="lg:hidden"
      />
    </>
  );
}

// Empty state for tables
interface TableEmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function TableEmptyState({
  title,
  description,
  action,
  icon,
  className
}: TableEmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-gray-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}