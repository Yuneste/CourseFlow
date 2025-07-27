'use client';

import { useState, useRef, useEffect, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, Folder, X, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { filesService } from '@/lib/services/files.service';
import { useAppStore } from '@/stores/useAppStore';
import { 
  validateFileType, 
  validateFileSize, 
  validateFileBatch,
  formatFileSize 
} from '@/lib/utils/file-validation';
import { detectCourseFromFile, getCourseSuggestions } from '@/lib/utils/course-detection';
import { analyzeFileContent } from '@/lib/utils/file-content-analysis';
import type { UploadProgress as UploadProgressType, File as FileType, Course } from '@/types';

interface FileUploadWithDetectionProps {
  courseId?: string;
  onUploadComplete?: () => void;
}

interface FileWithSuggestion {
  file: File;
  suggestedCourseId?: string;
  confidence?: number;
  matchReasons?: string[];
}

export function FileUploadWithDetection({ courseId, onUploadComplete }: FileUploadWithDetectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithSuggestion[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<Map<string, any>>(new Map());
  const [analyzingContent, setAnalyzingContent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const { 
    courses,
    addFile, 
    uploadQueue, 
    addToUploadQueue, 
    updateUploadProgress, 
    removeFromUploadQueue,
    clearUploadQueue 
  } = useAppStore();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const checkForDuplicates = useCallback(async (files: File[]) => {
    setCheckingDuplicates(true);
    const newDuplicates = new Map(duplicateFiles);

    try {
      for (const file of files) {
        const result = await filesService.checkDuplicate(file);
        if (result.isDuplicate) {
          newDuplicates.set(file.name, result.existingFile);
        }
      }
      setDuplicateFiles(newDuplicates);
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setCheckingDuplicates(false);
    }
  }, [duplicateFiles]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = useCallback(async (files: File[]) => {
    // Validate files
    const errors: string[] = [];
    const validFiles: FileWithSuggestion[] = [];

    // Batch validation
    const batchValidation = validateFileBatch(files);
    if (!batchValidation.valid) {
      setUploadErrors([batchValidation.error!]);
      return;
    }

    // Individual file validation and course detection
    for (const file of files) {
      const typeValidation = validateFileType(file);
      if (!typeValidation.valid) {
        errors.push(`${file.name}: ${typeValidation.error}`);
        continue;
      }

      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.valid) {
        errors.push(`${file.name}: ${sizeValidation.error}`);
        continue;
      }

      // Detect course if not already specified
      let fileWithSuggestion: FileWithSuggestion = { file };
      
      if (!courseId && courses.length > 0) {
        setAnalyzingContent(true);
        
        // Try content analysis first for supported file types
        if (file.type === 'application/pdf' || 
            file.type.includes('wordprocessingml') || 
            file.type.includes('msword') ||
            file.type.startsWith('text/')) {
          
          // Send file to server for content analysis
          const formData = new FormData();
          formData.append('file', file);
          
          try {
            const response = await fetch('/api/files/analyze-content', {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.analysis && result.analysis.length > 0) {
                const topMatch = result.analysis[0];
                if (topMatch.confidence >= 30) {
                  fileWithSuggestion = {
                    file,
                    suggestedCourseId: topMatch.courseId,
                    confidence: topMatch.confidence,
                    matchReasons: topMatch.matchReasons,
                  };
                }
              }
            }
          } catch (error) {
            console.error('Content analysis failed, falling back to filename:', error);
          }
        }
        
        // Fall back to filename detection if content analysis didn't work
        if (!fileWithSuggestion.suggestedCourseId) {
          const courseMatch = detectCourseFromFile(file.name, courses);
          if (courseMatch) {
            fileWithSuggestion = {
              file,
              suggestedCourseId: courseMatch.courseId,
              confidence: courseMatch.confidence,
              matchReasons: courseMatch.matchReasons,
            };
          }
        }
        
      } else if (courseId) {
        fileWithSuggestion.suggestedCourseId = courseId;
      }

      validFiles.push(fileWithSuggestion);
    }

    if (errors.length > 0) {
      setUploadErrors(errors);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      await checkForDuplicates(validFiles.map(f => f.file));
    }
    
    setAnalyzingContent(false);
  }, [courseId, courses, checkForDuplicates]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadErrors([]);

    try {
      // Group files by their target course
      const filesByCourse = new Map<string | undefined, File[]>();
      
      for (const fileWithSuggestion of selectedFiles) {
        const targetCourseId = fileWithSuggestion.suggestedCourseId;
        if (!filesByCourse.has(targetCourseId)) {
          filesByCourse.set(targetCourseId, []);
        }
        filesByCourse.get(targetCourseId)!.push(fileWithSuggestion.file);
      }

      // Upload files grouped by course
      const allResults: FileType[] = [];
      const allErrors: any[] = [];

      for (const [targetCourseId, files] of Array.from(filesByCourse.entries())) {
        const result = await filesService.uploadWithQueue(
          files,
          {
            courseId: targetCourseId,
            onFileProgress: (fileId: string, progress: UploadProgressType) => {
              updateUploadProgress(fileId, progress);
            }
          }
        );

        if (result.files) {
          allResults.push(...result.files);
        }
        if (result.errors) {
          allErrors.push(...result.errors);
        }
      }

      // Show errors if any
      if (allErrors.length > 0) {
        setUploadErrors(allErrors.map(e => e.error || 'Upload failed'));
      }

      // Clear selected files if all successful
      if (allErrors.length === 0) {
        setSelectedFiles([]);
        onUploadComplete?.();
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadErrors([error instanceof Error ? error.message : 'Upload failed']);
    } finally {
      setIsUploading(false);
      // Clear completed uploads after a delay
      setTimeout(() => {
        uploadQueue
          .filter(u => u.status === 'completed')
          .forEach(u => removeFromUploadQueue(u.fileId));
      }, 3000);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileCourse = (index: number, newCourseId: string | undefined) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        suggestedCourseId: newCourseId,
      };
      return updated;
    });
  };

  // Handle paste event for screenshots
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const filename = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
            const file = new File([blob], filename, { type: blob.type });
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        handleFiles(files);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [courses, handleFiles]);

  const getCourseById = (id: string) => courses.find(c => c.id === id);

  return (
    <div className="space-y-4">
      {/* Drag and drop zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="p-8 text-center"
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            Drag and drop files here
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Files will be analyzed to automatically detect which course they belong to
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Content analysis currently works for text files. PDF and Word analysis coming soon!
          </p>
          
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Select Files
            </Button>
            
            <Button
              variant="outline"
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
            >
              <Folder className="mr-2 h-4 w-4" />
              Select Folder
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="*/*"
          />
          
          <input
            ref={folderInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            {...{ webkitdirectory: '', directory: '' } as any}
          />
        </div>
      </Card>

      {/* Content Analysis Status */}
      {analyzingContent && (
        <Card className="p-4 border-primary bg-primary/10">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            <p className="text-sm">Analyzing file content to detect the appropriate course...</p>
          </div>
        </Card>
      )}

      {/* Upload errors */}
      {uploadErrors.length > 0 && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="space-y-1">
              {uploadErrors.map((error, index) => (
                <p key={index} className="text-sm text-destructive">{error}</p>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Selected files with course detection */}
      {selectedFiles.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Selected Files ({selectedFiles.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((fileWithSuggestion, index) => {
              const isDuplicate = duplicateFiles.has(fileWithSuggestion.file.name);
              const course = fileWithSuggestion.suggestedCourseId 
                ? getCourseById(fileWithSuggestion.suggestedCourseId)
                : null;

              return (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileWithSuggestion.file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(fileWithSuggestion.file.size)}
                      </span>
                      {isDuplicate && (
                        <Badge variant="secondary" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Duplicate
                        </Badge>
                      )}
                      {fileWithSuggestion.confidence && fileWithSuggestion.confidence > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {fileWithSuggestion.confidence}% match
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <select
                    className="text-sm border rounded px-2 py-1"
                    value={fileWithSuggestion.suggestedCourseId || ''}
                    onChange={(e) => updateFileCourse(index, e.target.value || undefined)}
                  >
                    <option value="">No course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelectedFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {checkingDuplicates && "Checking for duplicates..."}
            </div>
            <Button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </Card>
      )}

      {/* Upload progress */}
      {uploadQueue.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Upload Progress</h3>
          <div className="space-y-2">
            {uploadQueue.map((item) => (
              <div key={item.fileId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate flex-1">{item.fileName}</span>
                  <span className="text-muted-foreground">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
                {item.status === 'failed' && item.error && (
                  <p className="text-xs text-destructive">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}