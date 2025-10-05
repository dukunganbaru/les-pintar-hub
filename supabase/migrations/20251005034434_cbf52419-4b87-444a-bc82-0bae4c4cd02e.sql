-- Fix handle_new_user function to properly reference profile_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role user_role;
  v_profile_id uuid;
BEGIN
  -- Get role from metadata, default to student if not specified
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role);
  
  -- Insert profile and capture the generated ID
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_role
  )
  RETURNING id INTO v_profile_id;
  
  -- Create role-specific entries based on role using the captured profile_id
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
      v_profile_id,
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
      v_profile_id,
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
$function$;