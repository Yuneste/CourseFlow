'use client';

import { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  showIcon?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  showIcon = true,
  loading = false,
  children
}: ConfirmationDialogProps) {
  const icons = {
    default: <AlertCircle className="h-5 w-5" />,
    destructive: <AlertCircle className="h-5 w-5 text-destructive" />,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {showIcon && icons[variant]}
            {title}
          </AlertDialogTitle>
          {(description || children) && (
            <AlertDialogDescription>
              {description}
              {children}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              variant === 'destructive' && 'bg-destructive hover:bg-destructive/90'
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for easy confirmation dialogs
import { useState, useCallback } from 'react';

interface UseConfirmationOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirmation(options: UseConfirmationOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (options.onConfirm) {
      setLoading(true);
      try {
        await options.onConfirm();
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(false);
  };

  const ConfirmationDialogComponent = () => (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={options.title}
      description={options.description}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      onConfirm={handleConfirm}
      onCancel={options.onCancel}
      loading={loading}
    />
  );

  return {
    confirm,
    ConfirmationDialog: ConfirmationDialogComponent,
    isOpen,
    loading
  };
}

// Quick confirmation hooks
export function useDeleteConfirmation(onConfirm: () => void | Promise<void>) {
  return useConfirmation({
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmText: 'Delete',
    variant: 'destructive',
    onConfirm
  });
}

export function useSaveConfirmation(onConfirm: () => void | Promise<void>) {
  return useConfirmation({
    title: 'Save Changes',
    description: 'Do you want to save your changes?',
    confirmText: 'Save',
    variant: 'success',
    onConfirm
  });
}

export function useDiscardConfirmation(onConfirm: () => void | Promise<void>) {
  return useConfirmation({
    title: 'Discard Changes',
    description: 'Are you sure you want to discard your changes? Any unsaved data will be lost.',
    confirmText: 'Discard',
    variant: 'warning',
    onConfirm
  });
}

export function useLogoutConfirmation(onConfirm: () => void | Promise<void>) {
  return useConfirmation({
    title: 'Sign Out',
    description: 'Are you sure you want to sign out?',
    confirmText: 'Sign Out',
    onConfirm
  });
}