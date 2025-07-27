import { api } from '@/lib/api/client';
import type { File as FileType, UploadProgress } from '@/types';
import { calculateFileHash } from '@/lib/utils/file-validation';

export interface UploadOptions {
  courseId?: string;
  onProgress?: (progress: number) => void;
  onFileProgress?: (fileId: string, progress: UploadProgress) => void;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingFile?: {
    id: string;
    display_name: string;
    file_size: number;
    created_at: string;
    course_id?: string;
  };
}

class FilesService {
  /**
   * Upload files with progress tracking
   */
  async upload(files: File[], options: UploadOptions = {}) {
    const { courseId, onProgress, onFileProgress } = options;
    const formData = new FormData();
    
    // Add files to form data
    files.forEach(file => formData.append('files', file));
    if (courseId) {
      formData.append('course_id', courseId);
    }
    
    // Use XMLHttpRequest for progress tracking
    return new Promise<{ files: FileType[]; errors?: any[] }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
      
      // Handle completion
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || 'Upload failed'));
        }
      };
      
      // Handle errors
      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };
      
      // Handle abort
      xhr.onabort = () => {
        reject(new Error('Upload cancelled'));
      };
      
      // Send request
      xhr.open('POST', '/api/files/upload');
      xhr.send(formData);
    });
  }

  /**
   * Upload files with individual progress tracking
   */
  async uploadWithQueue(files: File[], options: UploadOptions = {}): Promise<{ files: FileType[]; errors: any[] }> {
    const { courseId, onFileProgress } = options;
    const results: { files: FileType[]; errors: any[] } = { files: [], errors: [] };
    
    // Process files sequentially for better progress tracking
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `temp-${Date.now()}-${i}`;
      
      try {
        // Notify progress start
        if (onFileProgress) {
          onFileProgress(tempId, {
            fileId: tempId,
            fileName: file.name,
            progress: 0,
            status: 'uploading',
          });
        }
        
        // Upload single file
        const response = await this.upload([file], {
          courseId,
          onProgress: (progress) => {
            if (onFileProgress) {
              onFileProgress(tempId, {
                fileId: tempId,
                fileName: file.name,
                progress,
                status: 'uploading',
              });
            }
          },
        });
        
        if (response.files && response.files.length > 0) {
          results.files.push(...response.files);
          
          // Notify completion
          if (onFileProgress) {
            onFileProgress(tempId, {
              fileId: response.files[0].id,
              fileName: file.name,
              progress: 100,
              status: 'completed',
            });
          }
        }
        
        if (response.errors && response.errors.length > 0) {
          results.errors.push(...response.errors);
          
          // Notify error
          if (onFileProgress && response.errors[0]) {
            onFileProgress(tempId, {
              fileId: tempId,
              fileName: file.name,
              progress: 0,
              status: 'failed',
              error: response.errors[0].error,
            });
          }
        }
        
      } catch (error) {
        results.errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
        
        // Notify error
        if (onFileProgress) {
          onFileProgress(tempId, {
            fileId: tempId,
            fileName: file.name,
            progress: 0,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Upload failed',
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Check if a file is a duplicate before uploading
   */
  async checkDuplicate(file: File): Promise<DuplicateCheckResult> {
    const hash = await calculateFileHash(file);
    return api.get<DuplicateCheckResult>(`/files/check-duplicate?hash=${hash}`);
  }

  /**
   * Get user's files
   */
  async getFiles(courseId?: string): Promise<FileType[]> {
    const query = courseId ? `?course_id=${courseId}` : '';
    return api.get<FileType[]>(`/files${query}`);
  }

  /**
   * Delete a file
   */
  async deleteFile(id: string): Promise<void> {
    return api.delete(`/files/${id}`);
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalSize: number;
    fileCount: number;
    byType: Record<string, { count: number; size: number }>;
  }> {
    const files = await this.getFiles();
    
    const stats = files.reduce((acc, file) => {
      acc.totalSize += file.file_size;
      acc.fileCount += 1;
      
      const type = file.file_type.split('/')[0] || 'other';
      if (!acc.byType[type]) {
        acc.byType[type] = { count: 0, size: 0 };
      }
      acc.byType[type].count += 1;
      acc.byType[type].size += file.file_size;
      
      return acc;
    }, {
      totalSize: 0,
      fileCount: 0,
      byType: {} as Record<string, { count: number; size: number }>,
    });
    
    return stats;
  }
}

export const filesService = new FilesService();