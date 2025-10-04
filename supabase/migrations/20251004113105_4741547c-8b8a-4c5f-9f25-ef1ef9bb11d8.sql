-- Create test users for each role
-- Note: These are sample users for testing purposes

-- Insert sample profiles for testing (these will be created when users sign up)
-- The actual user creation must be done through the signup flow or Supabase dashboard

-- Helper function to ensure profiles exist for test users
CREATE OR REPLACE FUNCTION create_test_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_role user_role
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, phone, address)
  VALUES (p_user_id, p_full_name, p_role, '+62812345678', 'Jakarta, Indonesia')
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Actual user accounts must be created through Supabase Auth
-- You can create them via:
-- 1. The signup page in your app
-- 2. Supabase Dashboard > Authentication > Users > Add User

-- After creating users in Supabase Auth, you can use this to set up their profiles:
-- SELECT create_test_profile('user-uuid-here', 'Name Here', 'admin'::user_role);
