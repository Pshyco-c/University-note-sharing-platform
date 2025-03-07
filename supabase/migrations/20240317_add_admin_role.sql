-- Add role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN role text DEFAULT 'user'::text
CHECK (role IN ('user', 'admin'));

-- Create admin role if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Grant necessary permissions to admin role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin;

-- Create policies for admin access
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can delete any notes"
  ON public.notes FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can view all notes"
  ON public.notes FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Function to create default admin user
CREATE OR REPLACE FUNCTION create_default_admin()
RETURNS void AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Create admin user in auth.users
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    'admin@studynotes.com', -- Change this to your desired admin email
    crypt('Admin@123', gen_salt('bf')), -- Change 'Admin@123' to your desired password
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"admin"}',
    NOW(),
    NOW(),
    'authenticated',
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO admin_user_id;

  -- Create admin profile
  INSERT INTO public.profiles (id, username, role)
  VALUES (admin_user_id, 'admin', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create default admin
SELECT create_default_admin();

-- Drop the function after use
DROP FUNCTION create_default_admin();

-- Create admin user if not exists
INSERT INTO auth.users (email, encrypted_password, role)
SELECT 
  current_setting('app.admin_email', true),
  crypt(current_setting('app.admin_password', true), gen_salt('bf')),
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE role = 'admin'
); 