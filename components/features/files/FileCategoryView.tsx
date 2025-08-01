'use client';

import { useState } from 'react';
import { 
  FileText, 
  FileImage, 
  Presentation, 
  BookOpen, 
  ClipboardCheck, 
  File,
  ChevronDown,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCard } from './FileCard';
import { useAppStore } from '@/stores/useAppStore';
import { getCategoryLabel } from '@/lib/utils/file-categorization';
import type { File as FileType } from '@/types';
import type { FileCategory } from '@/lib/utils/file-categorization';

interface FileCategoryViewProps {
  courseId?: string;
  onFileDelete?: (fileId: string) => void;
  onFileDownload?: (file: FileType) => void;
  onFilePreview?: (file: FileType) => void;
}

export function FileCategoryView({ courseId, onFileDelete, onFileDownload, onFilePreview }: FileCategoryViewProps) {
  const { files, getFilesByCourse } = useAppStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<FileCategory>>(
    new Set(['lecture', 'assignment', 'notes', 'exam', 'other'] as FileCategory[])
  );
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | null>(null);

  // Get files for the course or all files
  const displayFiles = courseId ? getFilesByCourse(courseId) : files;

  // Group files by category
  const filesByCategory = displayFiles.reduce((acc, file) => {
    const category = file.ai_category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(file);
    return acc;
  }, {} as Record<FileCategory, FileType[]>);

  // Get category icon
  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'lecture': return Presentation;
      case 'assignment': return FileText;
      case 'notes': return BookOpen;
      case 'exam': return ClipboardCheck;
      default: return File;
    }
  };

  // Get category color
  const getCategoryColor = (category: FileCategory) => {
    switch (category) {
      case 'lecture': return 'text-blue-600 bg-blue-50';
      case 'assignment': return 'text-green-600 bg-green-50';
      case 'notes': return 'text-purple-600 bg-purple-50';
      case 'exam': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const toggleCategory = (category: FileCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categories: FileCategory[] = ['lecture', 'assignment', 'notes', 'exam', 'other'];
  const visibleCategories = selectedCategory 
    ? [selectedCategory]
    : categories.filter(cat => filesByCategory[cat]?.length > 0);

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </Button>
        {categories.map(category => {
          const count = filesByCategory[category]?.length || 0;
          if (count === 0) return null;
          
          return (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
            >
              {getCategoryLabel(category)}
              <Badge variant="secondary" className="ml-2">
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Files by Category */}
      <div className="space-y-6">
        {visibleCategories.map(category => {
          const categoryFiles = filesByCategory[category] || [];
          if (categoryFiles.length === 0) return null;

          const Icon = getCategoryIcon(category);
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="space-y-3">
              <div 
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => toggleCategory(category)}
              >
                <Button variant="ghost" size="sm" className="p-1">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <div className={`p-1.5 rounded-lg ${getCategoryColor(category)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{getCategoryLabel(category)}</h3>
                <Badge variant="secondary">{categoryFiles.length}</Badge>
              </div>

              {isExpanded && (
                <div className="ml-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {categoryFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onDelete={onFileDelete}
                      onDownload={onFileDownload}
                      onPreview={onFilePreview}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {displayFiles.length === 0 && (
        <div className="text-center py-12">
          <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No files in this category</p>
        </div>
      )}
    </div>
  );
}