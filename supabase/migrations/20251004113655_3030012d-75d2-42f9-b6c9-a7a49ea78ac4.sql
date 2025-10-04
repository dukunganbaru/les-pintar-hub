-- Fix the handle_new_user trigger to handle all roles properly
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Get role from metadata, default to student if not specified
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role);
  
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_role
  );
  
  -- Create role-specific entries based on role
  IF v_role = 'teacher' THEN
    INSERT INTO public.teachers (
      user_id, 
      profile_id, 
      subjects, 
      education_levels, 
      hourly_rate,
      experience_years
    )
    VALUES (
      NEW.id,
      NEW.id,
      ARRAY['matematika']::text[],
      ARRAY['sma']::text[],
      100000,
      0
    );
  ELSIF v_role = 'student' THEN
    INSERT INTO public.students (
      user_id, 
      profile_id,
      education_level
    )
    VALUES (
      NEW.id,
      NEW.id,
      'sma'
    );
  ELSIF v_role = 'parent' THEN
    INSERT INTO public.parents (
      user_id
    )
    VALUES (
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add unique constraint to prevent duplicate profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);