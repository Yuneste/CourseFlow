'use client';

import { useEffect } from 'react';
import { FileX, Eye } from 'lucide-react';
import { FileCard } from './FileCard';
import { useAppStore } from '@/stores/useAppStore';
import { filesService } from '@/lib/services/files.service.client';
import type { File } from '@/types';

interface FileListProps {
  courseId?: string;
}

export function FileList({ courseId }: FileListProps) {
  const { 
    files, 
    isLoadingFiles, 
    filesError,
    setFiles,
    setLoadingFiles,
    setFilesError,
    deleteFile: deleteFileFromStore,
    getFilesByCourse,
    shouldRefetchFiles,
  } = useAppStore();

  // Fetch files on mount or when courseId changes
  useEffect(() => {
    const fetchFilesIfNeeded = async () => {
      if (shouldRefetchFiles()) {
        setLoadingFiles(true);
        setFilesError(null);

        try {
          const fetchedFiles = await filesService.getFiles(courseId);
          setFiles(fetchedFiles);
        } catch (error) {
          console.error('Error fetching files:', error);
          setFilesError(error instanceof Error ? error.message : 'Failed to fetch files');
        } finally {
          setLoadingFiles(false);
        }
      }
    };

    fetchFilesIfNeeded();
  }, [courseId, shouldRefetchFiles, setFiles, setLoadingFiles, setFilesError]);


  const fetchFiles = async () => {
    setLoadingFiles(true);
    setFilesError(null);

    try {
      const fetchedFiles = await filesService.getFiles(courseId);
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFilesError(error instanceof Error ? error.message : 'Failed to fetch files');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await filesService.deleteFile(fileId);
      deleteFileFromStore(fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      // You might want to show a toast notification here
    }
  };

  const handleDownload = async (file: File) => {
    try {
      // Get signed URL from the API
      const downloadData = await filesService.getDownloadUrl(file.id);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadData.url;
      link.download = downloadData.filename;
      link.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      // You might want to show a toast notification here
    }
  };

  const handlePreview = async (file: File) => {
    try {
      // Get signed URL for preview
      const downloadData = await filesService.getDownloadUrl(file.id);
      window.open(downloadData.url, '_blank');
    } catch (error) {
      console.error('Error previewing file:', error);
    }
  };

  // Filter files by course if courseId is provided
  const displayFiles = courseId ? getFilesByCourse(courseId) : files;

  if (isLoadingFiles) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading files...</p>
        </div>
      </div>
    );
  }

  if (filesError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Error loading files</p>
          <p className="text-sm text-destructive mt-2">{filesError}</p>
        </div>
      </div>
    );
  }

  if (displayFiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No files uploaded yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Upload files to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {displayFiles.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onPreview={handlePreview}
        />
      ))}
    </div>
  );
}