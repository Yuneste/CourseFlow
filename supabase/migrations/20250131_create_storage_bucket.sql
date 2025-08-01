-- Create storage bucket for user files if it doesn't exist
-- This migration ensures the user-files bucket is properly configured

-- First check if the bucket exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'user-files'
    ) THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'user-files',
            'user-files', 
            false, -- Private bucket
            52428800, -- 50MB file size limit
            ARRAY[
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'text/csv',
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'video/mp4',
                'video/mpeg',
                'video/quicktime',
                'audio/mpeg',
                'audio/wav',
                'application/zip',
                'application/x-rar-compressed',
                'application/x-7z-compressed'
            ]
        );
        
        RAISE NOTICE 'Created user-files storage bucket';
    ELSE
        RAISE NOTICE 'user-files bucket already exists';
    END IF;
END $$;

-- Set up RLS policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'user-files' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow users to view their own files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'user-files' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'user-files' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'user-files' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Also fix the inconsistency: update privacy page reference
-- Note: The privacy page references 'course-files' but should use 'user-files'
-- This is handled in the application code, not in the database