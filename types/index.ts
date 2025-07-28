export interface User {
  id: string;
  email: string;
  full_name: string;
  university?: string;
  study_program?: string;
  degree_type?: 'bachelor' | 'master' | 'phd' | 'diploma' | 'associate' | 'undergraduate' | 'graduate' | 'postgraduate' | 'other';
  start_year?: number;
  expected_graduation_year?: number;
  preferred_locale: string;
  country: string;
  timezone: string;
  academic_system: 'gpa' | 'ects' | 'uk_honours' | 'percentage';
  created_at: Date;
  avatar_url?: string;
}

export interface CourseFolder {
  id: string;
  name: string;
  path: string;
  parent_id?: string;
  course_id: string;
  created_at: Date;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  professor?: string;
  term: string;
  academic_period_type: 'semester' | 'term' | 'trimester';
  credits?: number;
  ects_credits?: number;
  color: string;
  emoji?: string;
  created_at: Date;
  updated_at: Date;
}

export interface File {
  id: string;
  user_id: string;
  course_id?: string;
  folder_id?: string;
  folder_path?: string;
  original_name: string;
  display_name: string;
  storage_url: string;
  file_type: string;
  file_size: number;
  file_hash: string;
  upload_source: 'web' | 'mobile' | 'api';
  is_academic_content: boolean;
  detected_language?: string;
  ai_category?: 'lecture' | 'assignment' | 'notes' | 'exam' | 'other';
  ai_summary?: string;
  ai_summary_translations?: Record<string, string>;
  ai_confidence?: number;
  created_at: Date;
  processed_at?: Date;
  upload_session_id?: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  fileSize?: number;
  progress: number;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  uploadSpeed?: number; // bytes per second
  pausedAt?: Date;
  resumeData?: any; // Data needed to resume upload
}