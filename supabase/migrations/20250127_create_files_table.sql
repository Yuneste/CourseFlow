-- Create files table for storing user uploaded files
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  original_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_hash TEXT NOT NULL, -- SHA-256 hash
  upload_source TEXT CHECK (upload_source IN ('web', 'mobile', 'api')),
  is_academic_content BOOLEAN DEFAULT true,
  detected_language TEXT,
  ai_category TEXT CHECK (ai_category IN ('lecture', 'assignment', 'notes', 'exam', 'other')),
  ai_summary TEXT,
  ai_summary_translations JSONB DEFAULT '{}',
  ai_confidence FLOAT CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  upload_session_id TEXT,
  UNIQUE(user_id, file_hash) -- Prevent same user uploading identical files
);

-- Create indexes for performance
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_course_id ON files(course_id);
CREATE INDEX idx_files_file_hash ON files(file_hash);
CREATE INDEX idx_files_created_at ON files(created_at DESC);

-- Upload analytics table
CREATE TABLE IF NOT EXISTS upload_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  upload_status TEXT CHECK (upload_status IN ('started', 'completed', 'failed', 'cancelled')),
  file_type TEXT,
  file_size BIGINT,
  upload_duration_ms INTEGER,
  error_reason TEXT,
  client_info JSONB, -- browser, OS, connection type
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX idx_upload_analytics_user_id ON upload_analytics(user_id);
CREATE INDEX idx_upload_analytics_upload_status ON upload_analytics(upload_status);
CREATE INDEX idx_upload_analytics_created_at ON upload_analytics(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for files table
-- Users can only SELECT their own files
CREATE POLICY "Users can view own files" ON files
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only INSERT files for themselves
CREATE POLICY "Users can insert own files" ON files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own files
CREATE POLICY "Users can update own files" ON files
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own files
CREATE POLICY "Users can delete own files" ON files
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for upload_analytics table
-- Users can only view their own analytics
CREATE POLICY "Users can view own upload analytics" ON upload_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own analytics
CREATE POLICY "Users can insert own upload analytics" ON upload_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON files TO authenticated;
GRANT ALL ON upload_analytics TO authenticated;