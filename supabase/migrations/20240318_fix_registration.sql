-- Drop existing tables and policies
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Note files are accessible by note viewers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload note files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own note files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own note files" ON storage.objects;

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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Drop existing table policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public notes are viewable by everyone" ON public.notes;
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Notes policies
CREATE POLICY "Public notes are viewable by everyone"
    ON public.notes FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can view own notes"
    ON public.notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
    ON public.notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
    ON public.notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
    ON public.notes FOR DELETE
    USING (auth.uid() = user_id);

-- Create storage bucket for notes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
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

CREATE POLICY "Authenticated users can upload note files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'notes'
        AND auth.role() = 'authenticated'
    );

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