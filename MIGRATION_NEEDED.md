# IMPORTANT: Database Migration Required

## Course Folders Migration

A database migration is required to enable the course folders feature. This migration:
- Creates the `course_folders` table
- Adds folder support to the files table
- Sets up automatic folder creation for new courses
- Creates default folders for existing courses

### To run the migration:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of: `supabase/migrations/20250128_create_course_folders_table.sql`
4. Click "Run"

### What this migration does:
- Creates 6 default folders for each course: Lectures, Assignments, Notes, Exams, Documents, Resources
- The Resources folder is marked as special (for future AI features)
- Folders can be reordered and new ones can be added
- Files can be organized into folders with drag-and-drop

**Note**: Until this migration is run, courses will not have folders and the folder features won't work properly.