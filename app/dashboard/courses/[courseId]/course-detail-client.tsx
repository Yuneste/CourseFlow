'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FolderOpen, Grid3x3, List, Settings, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/features/files/FileUpload';
import { FileCategoryView } from '@/components/features/files/FileCategoryView';
import { FileList } from '@/components/features/files/FileList';
import { StorageUsage } from '@/components/features/files/StorageUsage';
import { filesService } from '@/lib/services/files.service';
import { useAppStore } from '@/stores/useAppStore';
import { getCategoryLabel } from '@/lib/utils/file-categorization';
import type { Course, File } from '@/types';
import type { FileCategory } from '@/lib/utils/file-categorization';

interface CourseDetailClientProps {
  course: Course;
  initialFiles: File[];
}

export function CourseDetailClient({ course, initialFiles }: CourseDetailClientProps) {
  const router = useRouter();
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileViewMode, setFileViewMode] = useState<'list' | 'category'>('category');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | null>(null);
  
  const { setFiles } = useAppStore();

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles, setFiles]);

  const handleFileDelete = async (fileId: string) => {
    try {
      await filesService.deleteFile(fileId);
      const { deleteFile: deleteFileFromStore } = useAppStore.getState();
      deleteFileFromStore(fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleFileDownload = async (file: File) => {
    try {
      const downloadData = await filesService.getDownloadUrl(file.id);
      const link = document.createElement('a');
      link.href = downloadData.url;
      link.download = downloadData.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleFilePreview = async (file: File) => {
    try {
      const downloadData = await filesService.getDownloadUrl(file.id);
      window.open(downloadData.url, '_blank');
    } catch (error) {
      console.error('Error previewing file:', error);
    }
  };

  // Get file statistics by category
  const fileStats = initialFiles.reduce((acc, file) => {
    const category = file.ai_category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<FileCategory, number>);

  const categories: FileCategory[] = ['lecture', 'assignment', 'notes', 'exam', 'other'];

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
              <span className="text-4xl">{course.emoji}</span>
              {course.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {course.code && <span>{course.code}</span>}
              {course.professor && (
                <>
                  <span>•</span>
                  <span>{course.professor}</span>
                </>
              )}
              <span>•</span>
              <span>{course.term}</span>
              {course.credits && (
                <>
                  <span>•</span>
                  <span>{course.credits} credits</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Course Settings
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map(category => {
          const count = fileStats[category] || 0;
          const Icon = category === 'lecture' ? BookOpen : FolderOpen;
          
          return (
            <Card 
              key={category}
              className={`p-4 cursor-pointer transition-colors ${
                selectedCategory === category ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium capitalize">{category}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-muted-foreground">
                {count === 1 ? 'file' : 'files'}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Upload Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Course Files</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={fileViewMode === 'category' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setFileViewMode('category')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={fileViewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setFileViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => setShowFileUpload(!showFileUpload)}
            variant={showFileUpload ? 'secondary' : 'default'}
          >
            <Upload className="mr-2 h-4 w-4" />
            {showFileUpload ? 'Hide Upload' : 'Upload Files'}
          </Button>
        </div>
      </div>

      {showFileUpload && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-gray-900">Upload to {course.name}</h3>
            <p className="text-sm text-muted-foreground">
              Files will be automatically categorized and organized in your course directory.
            </p>
          </div>
          <FileUpload
            courseId={course.id}
            onUploadComplete={() => {
              // Refresh files
              window.location.reload();
            }}
          />
        </Card>
      )}

      {/* Storage Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StorageUsage userTier="free" />
      </div>

      {/* Files Display */}
      {fileViewMode === 'list' ? (
        <FileList courseId={course.id} />
      ) : (
        <FileCategoryView 
          courseId={course.id}
          onFileDelete={handleFileDelete}
          onFileDownload={handleFileDownload}
          onFilePreview={handleFilePreview}
        />
      )}
    </div>
    </>
  );
}