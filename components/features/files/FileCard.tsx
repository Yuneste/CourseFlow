'use client';

import { useState } from 'react';
import { 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  File, 
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
import type { File as FileType } from '@/types';

interface FileCardProps {
  file: FileType;
  onDelete?: (fileId: string) => void;
  onDownload?: (file: FileType) => void;
}

export function FileCard({ file, onDelete, onDownload }: FileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType === 'text/csv') 
      return FileSpreadsheet;
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text'))
      return FileText;
    return File;
  };

  const getFileColor = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'text-blue-600';
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType === 'text/csv') 
      return 'text-green-600';
    if (fileType.includes('pdf')) return 'text-red-600';
    if (fileType.includes('document')) return 'text-blue-800';
    return 'text-gray-600';
  };

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

  const Icon = getFileIcon(file.file_type);
  const iconColor = getFileColor(file.file_type);

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
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate" title={file.display_name}>
            {file.display_name}
          </h4>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span>{formatFileSize(file.file_size)}</span>
            <span>•</span>
            <span>{formatDate(file.created_at)}</span>
            {file.ai_category && (
              <>
                <span>•</span>
                <span className="capitalize">{file.ai_category}</span>
              </>
            )}
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
  );
}