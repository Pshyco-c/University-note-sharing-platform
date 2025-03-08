import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase client with:', {
  url: supabaseUrl,
  // Don't log the full key for security, just the first few characters
  keyPreview: supabaseAnonKey?.substring(0, 10) + '...'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Create the default client with anonymous key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check and log initial auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('Initial auth state:', {
    isAuthenticated: !!session,
    user: session?.user
  });
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', {
    event,
    isAuthenticated: !!session,
    user: session?.user
  });
});

export type Note = {
  id: string;
  title: string;
  content: string;
  university: string;
  course: string;
  professor: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
  file_url?: string;
  tags?: string[];
};

export type Profile = {
  id: string;
  username: string;
  university: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
};