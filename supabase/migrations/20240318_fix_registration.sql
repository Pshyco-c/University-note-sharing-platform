-- First, disable RLS to avoid any conflicts while modifying policies
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notes DISABLE ROW LEVEL SECURITY;

-- Drop existing tables (this will also drop their policies)
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with correct structure
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    university TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    role TEXT DEFAULT 'user'::text CHECK (role IN ('user', 'admin'))
);

-- Create notes table with correct structure
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    university TEXT NOT NULL,
    course TEXT NOT NULL,
    professor TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_public BOOLEAN DEFAULT false NOT NULL,
    file_url TEXT,
    tags TEXT[]
);

-- Create storage bucket for notes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', false)
ON CONFLICT (id) DO NOTHING;

-- Drop ALL existing policies
DO $$ 
BEGIN
    -- Drop all policies for profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Enable insert for registration" ON public.profiles;
    DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.profiles;
    DROP POLICY IF EXISTS "Enable profile creation" ON public.profiles;
    DROP POLICY IF EXISTS "Allow all for profiles" ON public.profiles;

    -- Drop all policies for notes
    DROP POLICY IF EXISTS "Public notes are viewable by everyone" ON public.notes;
    DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
    DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
    DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
    DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;

    -- Drop all policies for storage.objects
    DROP POLICY IF EXISTS "Note files are accessible by note viewers" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload note files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own note files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own note files" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN
        -- Do nothing, policy doesn't exist
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DO $$ 
BEGIN
    -- Most permissive policy for profiles - allow all operations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow all for profiles') THEN
        CREATE POLICY "Allow all for profiles"
            ON public.profiles
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Create policies for notes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Public notes are viewable by everyone') THEN
        CREATE POLICY "Public notes are viewable by everyone"
            ON public.notes FOR SELECT
            USING (is_public = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can view own notes') THEN
        CREATE POLICY "Users can view own notes"
            ON public.notes FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can insert own notes') THEN
        CREATE POLICY "Users can insert own notes"
            ON public.notes FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can update own notes') THEN
        CREATE POLICY "Users can update own notes"
            ON public.notes FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can delete own notes') THEN
        CREATE POLICY "Users can delete own notes"
            ON public.notes FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create policies for storage
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Note files are accessible by note viewers') THEN
        CREATE POLICY "Note files are accessible by note viewers"
            ON storage.objects FOR SELECT
            USING (
                bucket_id = 'notes'
                AND (
                    EXISTS (
                        SELECT 1 FROM public.notes
                        WHERE file_url = storage.objects.name
                        AND is_public = true
                    )
                    OR
                    EXISTS (
                        SELECT 1 FROM public.notes
                        WHERE file_url = storage.objects.name
                        AND user_id = auth.uid()
                    )
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload note files') THEN
        CREATE POLICY "Authenticated users can upload note files"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'notes'
                AND auth.role() = 'authenticated'
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can update own note files') THEN
        CREATE POLICY "Users can update own note files"
            ON storage.objects FOR UPDATE
            USING (
                bucket_id = 'notes'
                AND EXISTS (
                    SELECT 1 FROM public.notes
                    WHERE file_url = storage.objects.name
                    AND user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can delete own note files') THEN
        CREATE POLICY "Users can delete own note files"
            ON storage.objects FOR DELETE
            USING (
                bucket_id = 'notes'
                AND EXISTS (
                    SELECT 1 FROM public.notes
                    WHERE file_url = storage.objects.name
                    AND user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.notes;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 