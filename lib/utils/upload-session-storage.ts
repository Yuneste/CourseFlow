/**
 * Local storage management for incomplete upload sessions
 */

export interface UploadSession {
  id: string;
  fileHash: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  courseId?: string;
  uploadUrl?: string;
  bytesUploaded: number;
  totalBytes: number;
  createdAt: string;
  expiresAt: string;
  chunkSize?: number;
  metadata?: Record<string, any>;
}

const STORAGE_KEY = 'courseflow_upload_sessions';
const SESSION_EXPIRY_HOURS = 24;

/**
 * Get all stored upload sessions
 */
export function getUploadSessions(): UploadSession[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const sessions: UploadSession[] = JSON.parse(stored);
    
    // Filter out expired sessions
    const now = new Date();
    return sessions.filter(session => {
      const expiresAt = new Date(session.expiresAt);
      return expiresAt > now;
    });
  } catch (error) {
    console.error('Failed to load upload sessions:', error);
    return [];
  }
}

/**
 * Save an upload session
 */
export function saveUploadSession(session: Omit<UploadSession, 'createdAt' | 'expiresAt'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const sessions = getUploadSessions();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
    
    const newSession: UploadSession = {
      ...session,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    
    // Remove any existing session for the same file
    const filtered = sessions.filter(s => s.fileHash !== session.fileHash);
    filtered.push(newSession);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to save upload session:', error);
  }
}

/**
 * Get a specific upload session by file hash
 */
export function getUploadSession(fileHash: string): UploadSession | null {
  const sessions = getUploadSessions();
  return sessions.find(s => s.fileHash === fileHash) || null;
}

/**
 * Update an existing upload session
 */
export function updateUploadSession(
  fileHash: string,
  updates: Partial<UploadSession>
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const sessions = getUploadSessions();
    const index = sessions.findIndex(s => s.fileHash === fileHash);
    
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Failed to update upload session:', error);
  }
}

/**
 * Remove an upload session
 */
export function removeUploadSession(fileHash: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const sessions = getUploadSessions();
    const filtered = sessions.filter(s => s.fileHash !== fileHash);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove upload session:', error);
  }
}

/**
 * Clear all expired upload sessions
 */
export function clearExpiredSessions(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const sessions = getUploadSessions(); // This already filters expired
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to clear expired sessions:', error);
  }
}

/**
 * Check if a file has a resumable session
 */
export async function checkResumableUpload(
  file: File,
  fileHash: string
): Promise<{
  canResume: boolean;
  session?: UploadSession;
  progress?: number;
}> {
  const session = getUploadSession(fileHash);
  
  if (!session) {
    return { canResume: false };
  }
  
  // Verify file matches
  if (
    session.fileName !== file.name ||
    session.fileSize !== file.size ||
    session.fileType !== file.type
  ) {
    // File doesn't match, remove invalid session
    removeUploadSession(fileHash);
    return { canResume: false };
  }
  
  const progress = (session.bytesUploaded / session.totalBytes) * 100;
  
  return {
    canResume: true,
    session,
    progress,
  };
}

/**
 * Initialize session storage and clean up on load
 */
export function initializeUploadSessions(): void {
  if (typeof window === 'undefined') return;
  
  // Clear expired sessions on initialization
  clearExpiredSessions();
  
  // Set up periodic cleanup (every hour)
  setInterval(() => {
    clearExpiredSessions();
  }, 60 * 60 * 1000);
}