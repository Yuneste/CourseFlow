/**
 * File upload service
 * Handles all file upload operations with validation, deduplication, and storage
 */

import { createClient } from '@/lib/supabase/server';
import { 
  validateFileType, 
  validateFileSize, 
  validateMagicBytes,
  calculateFileHash,
  sanitizeFilename
} from '@/lib/utils/file-validation';
import { categorizeFile, getCategoryFolder } from '@/lib/utils/file-categorization';
import { logger } from '@/lib/services/logger.service';
import { FILE_UPLOAD, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import type { File as FileType } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Types
export interface UploadRequest {
  files: File[];
  courseId: string | null;
  folderId: string | null;
  userId: string;
  userAgent: string | null;
}

export interface UploadResult {
  file?: FileType;
  error?: string;
  filename: string;
}

export interface UploadResponse {
  files: FileType[];
  errors?: UploadResult[];
}

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  category?: string;
}

interface FileMetadata {
  user_id: string;
  course_id: string | null;
  folder_id: string | null;
  original_name: string;
  display_name: string;
  storage_url: string;
  file_type: string;
  file_size: number;
  file_hash: string;
  upload_source: 'web';
  is_academic_content: boolean;
  ai_category: string;
}

export class UploadService {
  /**
   * Validate upload request
   */
  static validateRequest(files: File[]): { isValid: boolean; error?: string } {
    if (!files || files.length === 0) {
      return { isValid: false, error: ERROR_MESSAGES.GENERIC };
    }

    if (files.length > FILE_UPLOAD.MAX_BATCH_SIZE) {
      return { 
        isValid: false, 
        error: `Maximum ${FILE_UPLOAD.MAX_BATCH_SIZE} files can be uploaded at once` 
      };
    }

    return { isValid: true };
  }

  /**
   * Validate a single file
   */
  private static async validateFile(file: File): Promise<FileValidationResult> {
    // Validate file type
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      return { isValid: false, error: typeValidation.error };
    }

    // Validate file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      return { isValid: false, error: sizeValidation.error };
    }

    // Validate magic bytes
    const magicValidation = await validateMagicBytes(file);
    if (!magicValidation.valid) {
      return { isValid: false, error: magicValidation.error };
    }

    return { isValid: true, category: typeValidation.category };
  }

  /**
   * Check for duplicate files
   */
  private static async checkDuplicate(
    supabase: SupabaseClient,
    userId: string,
    fileHash: string,
    courseId?: string | null
  ): Promise<{ isDuplicate: boolean; existingFileName?: string }> {
    // Check general duplicates
    const { data: existingFile } = await supabase
      .from('files')
      .select('id, display_name')
      .eq('user_id', userId)
      .eq('file_hash', fileHash)
      .single();

    if (existingFile) {
      return { 
        isDuplicate: true, 
        existingFileName: existingFile.display_name 
      };
    }

    // Check course-specific duplicates
    if (courseId) {
      const { data: courseFile } = await supabase
        .from('files')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('file_hash', fileHash)
        .single();

      if (courseFile) {
        return { isDuplicate: true };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Generate storage path
   */
  private static generateStoragePath(
    userId: string,
    fileName: string,
    categoryFolder: string,
    courseId?: string | null
  ): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const sanitizedName = sanitizeFilename(fileName);
    
    return courseId 
      ? `${userId}/${courseId}/${categoryFolder}/${timestamp}-${randomStr}-${sanitizedName}`
      : `${userId}/general/${categoryFolder}/${timestamp}-${randomStr}-${sanitizedName}`;
  }

  /**
   * Upload file to storage
   */
  private static async uploadToStorage(
    supabase: SupabaseClient,
    file: File,
    storagePath: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.storage
      .from('user-files')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      logger.error('Storage upload failed', error, {
        action: 'uploadToStorage',
        metadata: {
          storagePath,
          fileType: file.type,
          fileSize: file.size,
        }
      });
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Save file metadata to database
   */
  private static async saveFileMetadata(
    supabase: SupabaseClient,
    metadata: FileMetadata
  ): Promise<{ file?: FileType; error?: string }> {
    const { data, error } = await supabase
      .from('files')
      .insert(metadata)
      .select()
      .single();

    if (error) {
      logger.error('Failed to save file metadata', error, {
        action: 'saveFileMetadata',
        metadata: { ...metadata }
      });
      return { error: 'Failed to save file metadata' };
    }

    return { file: data };
  }

  /**
   * Track upload analytics
   */
  private static async trackAnalytics(
    supabase: SupabaseClient,
    userId: string,
    fileId: string,
    file: File,
    userAgent: string | null
  ): Promise<void> {
    try {
      await supabase.from('upload_analytics').insert({
        user_id: userId,
        file_id: fileId,
        upload_status: 'completed',
        file_type: file.type,
        file_size: file.size,
        upload_duration_ms: 0, // Would be calculated in real implementation
        client_info: { userAgent },
      });
    } catch (error) {
      logger.warn('Failed to track upload analytics', {
        action: 'trackAnalytics',
        metadata: { fileId }
      });
    }
  }

  /**
   * Process single file upload
   */
  static async processFile(
    supabase: SupabaseClient,
    file: File,
    userId: string,
    courseId: string | null,
    folderId: string | null,
    userAgent: string | null
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.isValid) {
        return { error: validation.error, filename: file.name };
      }

      // Calculate file hash
      const fileHash = await calculateFileHash(file);

      // Check for duplicates
      const duplicateCheck = await this.checkDuplicate(supabase, userId, fileHash, courseId);
      if (duplicateCheck.isDuplicate) {
        const error = duplicateCheck.existingFileName
          ? `Duplicate file already exists: ${duplicateCheck.existingFileName}`
          : ERROR_MESSAGES.DUPLICATE_FILE;
        return { error, filename: file.name };
      }

      // Categorize file
      const aiCategory = categorizeFile(file.name);
      const categoryFolder = getCategoryFolder(aiCategory);

      // Generate storage path
      const storagePath = this.generateStoragePath(userId, file.name, categoryFolder, courseId);

      // Upload to storage
      const uploadResult = await this.uploadToStorage(supabase, file, storagePath);
      if (!uploadResult.success) {
        return { 
          error: `${ERROR_MESSAGES.UPLOAD_FAILED}: ${uploadResult.error}`, 
          filename: file.name 
        };
      }

      // Prepare file metadata
      const metadata: FileMetadata = {
        user_id: userId,
        course_id: courseId,
        folder_id: folderId,
        original_name: file.name,
        display_name: file.name,
        storage_url: storagePath,
        file_type: file.type,
        file_size: file.size,
        file_hash: fileHash,
        upload_source: 'web',
        is_academic_content: true, // For MVP, all content is considered valid
        ai_category: aiCategory,
      };

      // Save to database
      const { file: savedFile, error: dbError } = await this.saveFileMetadata(supabase, metadata);
      if (dbError) {
        // Clean up uploaded file on database error
        await supabase.storage.from('user-files').remove([storagePath]);
        return { error: dbError, filename: file.name };
      }

      // Track analytics
      if (savedFile) {
        await this.trackAnalytics(supabase, userId, savedFile.id, file, userAgent);
      }

      return { file: savedFile, filename: file.name };

    } catch (error) {
      logger.error('Error processing file upload', error, {
        action: 'processFile',
        metadata: { filename: file.name }
      });
      return { error: ERROR_MESSAGES.GENERIC, filename: file.name };
    }
  }

  /**
   * Process batch file upload
   */
  static async uploadBatch(request: UploadRequest): Promise<UploadResponse> {
    const supabase = await createClient();
    
    // Process files in parallel for better performance
    const uploadPromises = request.files.map(file =>
      this.processFile(
        supabase,
        file,
        request.userId,
        request.courseId,
        request.folderId,
        request.userAgent
      )
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Separate successful and failed uploads
    const successfulUploads = uploadResults.filter(r => r.file).map(r => r.file!);
    const failedUploads = uploadResults.filter(r => r.error);

    // Log batch upload completion
    logger.info('Batch file upload completed', {
      action: 'uploadBatch',
      metadata: {
        userId: request.userId,
        filesUploaded: successfulUploads.length,
        filesFailed: failedUploads.length,
      }
    });

    return {
      files: successfulUploads,
      errors: failedUploads.length > 0 ? failedUploads : undefined,
    };
  }

  /**
   * Delete file from storage and database
   */
  static async deleteFile(fileId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    // Get file info
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('storage_url')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !file) {
      throw new Error('File not found');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-files')
      .remove([file.storage_url]);

    if (storageError) {
      logger.error('Failed to delete file from storage', storageError, {
        action: 'deleteFile',
        metadata: { fileId, storageUrl: file.storage_url }
      });
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId);

    if (dbError) {
      throw dbError;
    }
  }
}