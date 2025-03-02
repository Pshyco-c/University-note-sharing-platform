-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  university text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notes table
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  university text not null,
  course text not null,
  professor text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  is_public boolean default false not null,
  file_url text,
  tags text[]
);

-- Create RLS policies
alter table public.profiles enable row level security;
alter table public.notes enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Notes policies
create policy "Public notes are viewable by everyone"
  on public.notes for select
  using (is_public = true);

create policy "Users can view their own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- Create storage bucket for note files
insert into storage.buckets (id, name)
values ('notes', 'notes');

-- Set up storage policies
create policy "Note files are accessible by note viewers"
  on storage.objects for select
  using (
    bucket_id = 'notes'
    and (
      -- Public notes' files are accessible by everyone
      exists (
        select 1 from public.notes
        where file_url = storage.objects.name
        and is_public = true
      )
      or
      -- Private notes' files are only accessible by the owner
      exists (
        select 1 from public.notes
        where file_url = storage.objects.name
        and user_id = auth.uid()
      )
    )
  );

create policy "Authenticated users can upload note files"
  on storage.objects for insert
  with check (
    bucket_id = 'notes'
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own note files"
  on storage.objects for update
  using (
    bucket_id = 'notes'
    and exists (
      select 1 from public.notes
      where file_url = storage.objects.name
      and user_id = auth.uid()
    )
  );

create policy "Users can delete their own note files"
  on storage.objects for delete
  using (
    bucket_id = 'notes'
    and exists (
      select 1 from public.notes
      where file_url = storage.objects.name
      and user_id = auth.uid()
    )
  );

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on public.notes
  for each row
  execute function public.handle_updated_at(); 