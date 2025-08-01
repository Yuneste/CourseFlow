'use client';

import { useState, DragEvent } from 'react';
import { 
  Download, 
  Trash2, 
  MoreVertical,
  Move
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatFileSize } from '@/lib/utils/file-validation';
import { getFileIcon } from '@/lib/utils/file-icons';
import { DeleteFileDialog } from '@/components/dialogs/DeleteFileDialog';
import type { File as FileType } from '@/types';
import { cn } from '@/lib/utils';

interface FileCardDraggableProps {
  file: FileType;
  isSelected?: boolean;
  onSelect?: (fileId: string, isMultiple: boolean) => void;
  onDelete?: (fileId: string) => void;
  onDownload?: (file: FileType) => void;
  onDragStart?: (file: FileType) => void;
  onDragEnd?: () => void;
}

export function FileCardDraggable({ 
  file, 
  isSelected,
  onSelect,
  onDelete, 
  onDownload,
  onDragStart,
  onDragEnd 
}: FileCardDraggableProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(file.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting file:', error);
      setIsDeleting(false);
    }
  };

  const iconConfig = getFileIcon(file.display_name);
  const Icon = iconConfig.icon;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      onSelect(file.id, e.ctrlKey || e.metaKey || e.shiftKey);
    }
  };

  const handleDragStart = (e: DragEvent) => {
    setIsDragging(true);
    onDragStart?.(file);
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ fileId: file.id }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  return (
    <>
      <Card 
        className={cn(
        "group p-4 transition-all duration-200 cursor-pointer select-none",
        "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5",
        "active:scale-[0.98] active:shadow-sm",
        isSelected && "ring-2 ring-primary bg-primary/5 shadow-md scale-[1.01]",
        isDragging && "opacity-50 scale-95"
      )}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg transition-all duration-200",
          iconConfig.bgColor,
          "group-hover:scale-110 group-hover:rotate-3"
        )}>
          <Icon className={cn(
            "h-6 w-6 transition-transform duration-200",
            iconConfig.color
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate" title={file.display_name}>
            {file.display_name}
          </h4>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span>{formatFileSize(file.file_size)}</span>
            <span>•</span>
            <span>{formatDate(file.created_at)}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onDownload?.(file);
            }}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
    
    <DeleteFileDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      fileName={file.display_name}
      onConfirm={handleDelete}
      isDeleting={isDeleting}
    />
    </>
  );
}