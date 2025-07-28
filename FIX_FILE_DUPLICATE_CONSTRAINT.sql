-- Check current constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'files'::regclass
AND conname LIKE '%user%hash%';

-- Drop the old constraint that prevents files across all courses
ALTER TABLE files 
DROP CONSTRAINT IF EXISTS files_user_id_file_hash_key;

-- Add new constraint that only prevents duplicates within the same course
ALTER TABLE files 
ADD CONSTRAINT unique_file_per_course UNIQUE(user_id, course_id, file_hash);

-- This allows:
-- ✅ Same file in different courses
-- ❌ Same file uploaded twice to the same course

-- Verify the change
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'files'::regclass
AND contype = 'u';