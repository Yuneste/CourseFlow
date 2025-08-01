'use client';

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
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileCount?: number;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteFileDialog({
  open,
  onOpenChange,
  fileCount,
  onConfirm,
  isDeleting = false,
}: DeleteFileDialogProps) {
  const isBulkDelete = fileCount && fileCount > 1;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <FileText className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle>
              {isBulkDelete ? `Delete ${fileCount} files?` : 'Delete file?'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {isBulkDelete ? (
              <>
                Are you sure you want to delete these {fileCount} files? 
                <br />
                <span className="font-medium text-destructive">
                  This action cannot be undone.
                </span>
              </>
            ) : (
              <>
                Are you sure you want to delete this file?
                <br />
                <span className="font-medium text-destructive">
                  This action cannot be undone.
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              "bg-destructive hover:bg-destructive/90",
              isDeleting && "opacity-50 cursor-not-allowed"
            )}
          >
            {isDeleting ? 'Deleting...' : isBulkDelete ? `Delete ${fileCount} files` : 'Delete file'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}