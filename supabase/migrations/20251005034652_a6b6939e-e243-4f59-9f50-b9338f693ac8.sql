-- Add foreign key constraints for profile_id if they don't exist
DO $$
BEGIN
  -- Add foreign key for students.profile_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'students_profile_id_fkey' 
    AND table_name = 'students'
  ) THEN
    ALTER TABLE public.students
    ADD CONSTRAINT students_profile_id_fkey 
    FOREIGN KEY (profile_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;

  -- Add foreign key for teachers.profile_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'teachers_profile_id_fkey' 
    AND table_name = 'teachers'
  ) THEN
    ALTER TABLE public.teachers
    ADD CONSTRAINT teachers_profile_id_fkey 
    FOREIGN KEY (profile_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;