'use client';

import { useState } from 'react';
import { 
  Download, 
  Trash2, 
  MoreVertical
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
import type { File as FileType } from '@/types';

interface FileCardProps {
  file: FileType;
  onDelete?: (fileId: string) => void;
  onDownload?: (file: FileType) => void;
}

export function FileCard({ file, onDelete, onDownload }: FileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);


  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${file.display_name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete?.(file.id);
      } catch (error) {
        console.error('Error deleting file:', error);
        setIsDeleting(false);
      }
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

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${iconConfig.bgColor}`}>
            <Icon className={`h-6 w-6 ${iconConfig.color}`} />
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
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isDeleting}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDownload?.(file)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {file.ai_summary && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {file.ai_summary}
          </p>
        )}
      </Card>
    </>
  );
}