/**
 * TUS Protocol implementation for resumable uploads
 * Using Supabase Storage resumable upload feature
 */

import { getSupabaseClient } from '@/lib/supabase/client-singleton';
import { 
  saveUploadSession, 
  getUploadSession, 
  updateUploadSession, 
  removeUploadSession 
} from './upload-session-storage';
import { calculateFileHash } from './file-validation';

export interface TusUploadOptions {
  file: File;
  courseId?: string;
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  onSuccess?: (uploadUrl: string) => void;
  onError?: (error: Error) => void;
  chunkSize?: number; // Default 5MB
}

export interface TusUpload {
  start: () => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  abort: () => void;
  isPaused: () => boolean;
  getProgress: () => number;
}

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

export class TusResumableUpload implements TusUpload {
  private file: File;
  private courseId?: string;
  private fileHash: string = '';
  private uploadUrl: string = '';
  private bytesUploaded: number = 0;
  private chunkSize: number;
  private isPausedFlag: boolean = false;
  private abortController: AbortController | null = null;
  private onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  private onSuccess?: (uploadUrl: string) => void;
  private onError?: (error: Error) => void;
  private retryCount: number = 0;

  constructor(options: TusUploadOptions) {
    this.file = options.file;
    this.courseId = options.courseId;
    this.chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
    this.onProgress = options.onProgress;
    this.onSuccess = options.onSuccess;
    this.onError = options.onError;
  }

  async start(): Promise<void> {
    try {
      // Calculate file hash
      this.fileHash = await calculateFileHash(this.file);
      
      // Check for existing session
      const existingSession = getUploadSession(this.fileHash);
      if (existingSession && existingSession.uploadUrl) {
        this.uploadUrl = existingSession.uploadUrl;
        this.bytesUploaded = existingSession.bytesUploaded;
        
        // Resume from existing session
        await this.resume();
        return;
      }

      // Initialize new upload
      await this.initializeUpload();
      await this.uploadChunks();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async initializeUpload(): Promise<void> {
    const supabase = getSupabaseClient();
    const fileName = `${Date.now()}-${this.file.name}`;
    const filePath = this.courseId 
      ? `user-files/${this.courseId}/${fileName}`
      : `user-files/uncategorized/${fileName}`;

    // Create upload URL using Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-files')
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      throw new Error('Failed to create upload URL');
    }

    this.uploadUrl = data.signedUrl;
    
    // Save upload session
    saveUploadSession({
      id: crypto.randomUUID(),
      fileHash: this.fileHash,
      fileName: this.file.name,
      fileSize: this.file.size,
      fileType: this.file.type,
      courseId: this.courseId,
      uploadUrl: this.uploadUrl,
      bytesUploaded: 0,
      totalBytes: this.file.size,
      chunkSize: this.chunkSize,
      metadata: {
        filePath,
      },
    });
  }

  private async uploadChunks(): Promise<void> {
    this.abortController = new AbortController();

    while (this.bytesUploaded < this.file.size && !this.isPausedFlag) {
      const start = this.bytesUploaded;
      const end = Math.min(start + this.chunkSize, this.file.size);
      const chunk = this.file.slice(start, end);

      try {
        await this.uploadChunk(chunk, start, end);
        this.bytesUploaded = end;
        
        // Update session
        updateUploadSession(this.fileHash, {
          bytesUploaded: this.bytesUploaded,
        });

        // Report progress
        if (this.onProgress) {
          this.onProgress(this.bytesUploaded, this.file.size);
        }

        // Reset retry count on successful chunk
        this.retryCount = 0;
      } catch (error) {
        if (this.abortController.signal.aborted) {
          break;
        }

        // Handle retry
        if (this.retryCount < MAX_RETRIES) {
          await this.retryWithBackoff();
          continue;
        }

        throw error;
      }
    }

    // Upload completed
    if (this.bytesUploaded >= this.file.size) {
      removeUploadSession(this.fileHash);
      if (this.onSuccess) {
        this.onSuccess(this.uploadUrl);
      }
    }
  }

  private async uploadChunk(
    chunk: Blob,
    start: number,
    end: number
  ): Promise<void> {
    const response = await fetch(this.uploadUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/offset+octet-stream',
        'Upload-Offset': start.toString(),
        'Content-Length': chunk.size.toString(),
      },
      body: chunk,
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  }

  private async retryWithBackoff(): Promise<void> {
    const delay = RETRY_DELAYS[this.retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    this.retryCount++;
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  pause(): void {
    this.isPausedFlag = true;
    this.abortController?.abort();
  }

  async resume(): Promise<void> {
    if (!this.isPausedFlag && this.bytesUploaded > 0) {
      // Already uploading
      return;
    }

    this.isPausedFlag = false;
    this.retryCount = 0;

    // Get latest session data
    const session = getUploadSession(this.fileHash);
    if (session) {
      this.bytesUploaded = session.bytesUploaded;
      this.uploadUrl = session.uploadUrl || this.uploadUrl;
    }

    // Resume upload
    await this.uploadChunks();
  }

  abort(): void {
    this.isPausedFlag = true;
    this.abortController?.abort();
    removeUploadSession(this.fileHash);
  }

  isPaused(): boolean {
    return this.isPausedFlag;
  }

  getProgress(): number {
    return (this.bytesUploaded / this.file.size) * 100;
  }

  private handleError(error: Error): void {
    console.error('TUS upload error:', error);
    if (this.onError) {
      this.onError(error);
    }
  }
}

/**
 * Create a resumable upload
 */
export function createResumableUpload(options: TusUploadOptions): TusUpload {
  return new TusResumableUpload(options);
}

/**
 * Check if file has an existing resumable session
 */
export async function checkResumableSession(file: File): Promise<{
  hasSession: boolean;
  progress?: number;
  canResume?: boolean;
}> {
  try {
    const fileHash = await calculateFileHash(file);
    const session = getUploadSession(fileHash);
    
    if (!session) {
      return { hasSession: false };
    }

    // Verify file matches
    if (
      session.fileName !== file.name ||
      session.fileSize !== file.size ||
      session.fileType !== file.type
    ) {
      removeUploadSession(fileHash);
      return { hasSession: false };
    }

    const progress = (session.bytesUploaded / session.totalBytes) * 100;

    return {
      hasSession: true,
      progress,
      canResume: true,
    };
  } catch (error) {
    console.error('Error checking resumable session:', error);
    return { hasSession: false };
  }
}