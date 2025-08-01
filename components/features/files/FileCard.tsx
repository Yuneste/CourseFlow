'use client';

import { useState } from 'react';
import { 
  Download, 
  Trash2, 
  MoreVertical,
  Calendar,
  FileText,
  Eye,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/utils/file-validation';
import { getFileIcon } from '@/lib/utils/file-icons';
import { getCategoryLabel } from '@/lib/utils/file-categorization';
import type { File as FileType } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FileCardProps {
  file: FileType;
  onDelete?: (fileId: string) => void;
  onDownload?: (file: FileType) => void;
  onPreview?: (file: FileType) => void;
}

export function FileCard({ file, onDelete, onDownload, onPreview }: FileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      const hours = Math.floor(diffTime / (1000 * 60 * 60));
      if (hours < 1) {
        const minutes = Math.floor(diffTime / (1000 * 60));
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      }
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Category-based gradient colors
  const getCategoryGradient = (category?: string) => {
    switch (category) {
      case 'lecture':
        return 'from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20';
      case 'assignment':
        return 'from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20';
      case 'notes':
        return 'from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20';
      case 'exam':
        return 'from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20';
      default:
        return 'from-gray-500/10 to-slate-500/10 hover:from-gray-500/20 hover:to-slate-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-300 cursor-pointer group",
          "hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20",
          "border-gray-100 dark:border-gray-800",
          isDeleting && "opacity-50"
        )}
        onClick={() => onPreview?.(file)}
      >
        {/* Background Gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br transition-all duration-300",
          getCategoryGradient(file.ai_category)
        )} />
        
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300",
              iconConfig.bgColor,
              isHovered && "scale-110 rotate-3"
            )}>
              <Icon className={`h-6 w-6 ${iconConfig.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-lg" title={file.display_name}>
                {file.display_name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {file.ai_category && (
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryLabel(file.ai_category)}
                  </Badge>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.file_size)}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={isDeleting}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onPreview?.(file);
                }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
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
                    handleDelete();
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* AI Summary */}
          {file.ai_summary && (
            <div className="mb-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {file.ai_summary}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(file.created_at)}</span>
          </div>

          {/* Hover Effect */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      </Card>
    </motion.div>
  );
}