/*
  # Initial Schema Setup for University Notes App

  1. New Tables
    - profiles
      - Stores user profile information
    - universities
      - List of universities
    - courses
      - Course information linked to universities
    - notes
      - Note entries with metadata and content
    - note_access
      - Controls note sharing and permissions

  2. Security
    - RLS policies for all tables
    - Authenticated users can read/write their own data
    - Public notes are readable by all authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  university_id uuid REFERENCES universities,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create universities table
CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  website text,
  created_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES universities NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(university_id, code)
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course_id uuid REFERENCES courses,
  title text NOT NULL,
  description text,
  content_url text,
  file_type text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create note_access table for sharing
CREATE TABLE IF NOT EXISTS note_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  access_type text CHECK (access_type IN ('view', 'edit')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(note_id, user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_access ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Universities policies
CREATE POLICY "Universities are viewable by all authenticated users"
  ON universities FOR SELECT
  TO authenticated
  USING (true);

-- Courses policies
CREATE POLICY "Courses are viewable by all authenticated users"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- Notes policies
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR is_public = true
    OR EXISTS (
      SELECT 1 FROM note_access
      WHERE note_id = notes.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Note access policies
CREATE POLICY "Users can view their note access entries"
  ON note_access FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM notes
      WHERE id = note_access.note_id
      AND user_id = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();