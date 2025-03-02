import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(false);

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        console.log('Supabase connection test:', { data, error });
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connection successful');
        }
      } catch (error) {
        console.error('Failed to test Supabase connection:', error);
      }
    };

    testConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Form Data:', { email, username, university }); // Log form data
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL); // Log Supabase URL

    try {
      console.log('Starting registration process...');
      
      // Test connection again before registration
      const { error: testError } = await supabase.from('profiles').select('count').limit(1);
      if (testError) {
        console.error('Database connection test failed:', testError);
        throw new Error('Unable to connect to the database. Please try again.');
      }

      // First, register the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            university
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      console.log('Auth response:', {
        user: authData?.user,
        session: authData?.session,
        error: authError
      });

      if (authError) {
        console.error('Auth error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        });
        throw authError;
      }

      if (!authData.user) {
        console.error('No user data in response');
        throw new Error('No user data returned');
      }

      console.log('Creating profile for user:', authData.user.id);

      // Create the user profile with RLS bypass
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          university,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      console.log('Profile creation response:', {
        data: profileData,
        error: profileError
      });

      if (profileError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.error('Profile error details:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint
        });
        throw profileError;
      }

      toast.success('Registration successful! Please check your email for verification.');
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        details: error
      });
      // Show a more user-friendly error message
      let errorMessage = 'Failed to register. Please try again.';
      if (error.message?.includes('duplicate key')) {
        errorMessage = 'This username or email is already taken.';
      } else if (error.message?.includes('row-level security')) {
        errorMessage = 'Unable to create profile. Please try again.';
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-2">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Create a strong password"
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
            </div>
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                University
              </label>
              <input
                id="university"
                name="university"
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your university"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 