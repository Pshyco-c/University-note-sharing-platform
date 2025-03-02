-- First, drop existing policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

-- Then recreate them with correct permissions
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (true);  -- Allow any authenticated user to create their profile

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Enable replication for auth.users
alter publication supabase_realtime add table auth.users; 