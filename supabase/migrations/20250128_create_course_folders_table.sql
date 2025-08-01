-- Create course folders table for directory structure
CREATE TABLE course_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES course_folders(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_special BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique folder names within the same parent
  UNIQUE(course_id, parent_id, name)
);

-- Create indexes
CREATE INDEX idx_course_folders_course_id ON course_folders(course_id);
CREATE INDEX idx_course_folders_parent_id ON course_folders(parent_id);
CREATE INDEX idx_course_folders_path ON course_folders(path);

-- Enable Row Level Security
ALTER TABLE course_folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view folders for their courses" ON course_folders
  FOR SELECT USING (
    course_id IN (
      SELECT id FROM courses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create folders for their courses" ON course_folders
  FOR INSERT WITH CHECK (
    course_id IN (
      SELECT id FROM courses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update folders for their courses" ON course_folders
  FOR UPDATE USING (
    course_id IN (
      SELECT id FROM courses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete folders for their courses" ON course_folders
  FOR DELETE USING (
    course_id IN (
      SELECT id FROM courses WHERE user_id = auth.uid()
    )
  );

-- Add folder_id and folder_path to files table
ALTER TABLE files 
ADD COLUMN folder_id UUID REFERENCES course_folders(id) ON DELETE SET NULL,
ADD COLUMN folder_path TEXT;

-- Create index on folder_id
CREATE INDEX idx_files_folder_id ON files(folder_id);

-- Function to create default folders for a course
CREATE OR REPLACE FUNCTION create_default_course_folders(course_id UUID)
RETURNS void AS $$
DECLARE
  course_name TEXT;
BEGIN
  -- Get course name
  SELECT name INTO course_name FROM courses WHERE id = course_id;
  
  -- Create default folders with proper order
  INSERT INTO course_folders (course_id, name, path, display_order, is_special) VALUES
    (course_id, 'Lectures', course_name || '/Lectures', 1, false),
    (course_id, 'Assignments', course_name || '/Assignments', 2, false),
    (course_id, 'Notes', course_name || '/Notes', 3, false),
    (course_id, 'Exams', course_name || '/Exams', 4, false),
    (course_id, 'Documents', course_name || '/Documents', 5, false),
    (course_id, 'Resources', course_name || '/Resources', 6, true);
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default folders when a course is created
CREATE OR REPLACE FUNCTION on_course_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_course_folders(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_course_folders_trigger
AFTER INSERT ON courses
FOR EACH ROW
EXECUTE FUNCTION on_course_created();

-- Create default folders for existing courses
DO $$
DECLARE
  course RECORD;
BEGIN
  FOR course IN SELECT id FROM courses LOOP
    PERFORM create_default_course_folders(course.id);
  END LOOP;
END $$;