'use client';

import { File as FileIcon } from 'lucide-react';
import { FileCard } from './FileCard';
import { useAppStore } from '@/stores/useAppStore';
import type { File as FileType } from '@/types';

interface FileListViewProps {
  courseId?: string;
  onFileDelete?: (fileId: string) => void;
  onFileDownload?: (file: FileType) => void;
  onFilePreview?: (file: FileType) => void;
}

export function FileListView({ courseId, onFileDelete, onFileDownload, onFilePreview }: FileListViewProps) {
  const { files, getFilesByCourse } = useAppStore();

  // Get files for the course or all files
  const displayFiles = courseId ? getFilesByCourse(courseId) : files;

  return (
    <div className="space-y-4">
      {displayFiles.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {displayFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={onFileDelete}
              onDownload={onFileDownload}
              onPreview={onFilePreview}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {courseId ? 'No files in this course' : 'No files uploaded yet'}
          </p>
        </div>
      )}
    </div>
  );
}