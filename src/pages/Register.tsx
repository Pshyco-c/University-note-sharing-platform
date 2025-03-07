import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, School, UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get the current origin for redirect URLs
  const origin = window.location.origin;

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
    console.log('Redirect URL:', `${origin}/verify`); // Log redirect URL

    try {
      console.log('Starting registration process...');
      
      // Test connection again before registration
      const { error: testError } = await supabase.from('profiles').select('count').limit(1);
      if (testError) {
        console.error('Database connection test failed:', testError);
        throw new Error('Unable to connect to the database. Please try again.');
      }

      // First, register the user with redirect to verification page
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            university
          },
          // Redirect to a verification page on the current domain
          emailRedirectTo: `${origin}/verify`
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

      // Create the user profile
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
        console.error('Profile error details:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint
        });
        // Instead of trying to delete the auth user (which requires admin rights),
        // we'll let the user try again or contact support
        throw new Error('Failed to create user profile. Please try again or contact support if the issue persists.');
      }

      toast.success('Registration successful! Please check your email for verification.');
      // Redirect to the verification sent page with the email
      navigate('/verification-sent', { state: { email } });
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
      } else if (error.message?.includes('Failed to create user profile')) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in bg-modern-light-bg dark:bg-modern-dark-bg">
      <div className="max-w-md w-full space-y-8 bg-modern-light-card dark:bg-modern-dark-card p-8 rounded-2xl shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-dark-card-hover border-2 border-modern-light-border dark:border-modern-dark-border transition-all duration-300">
        <div className="space-y-3">
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-accent-gradient-start to-accent-gradient-end bg-clip-text text-transparent dark:from-accent-gradient-start-dark dark:to-accent-gradient-end-dark">
            Create your account
          </h2>
          <p className="text-center text-sm text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent-violet hover:text-accent-teal dark:text-accent-violet-light dark:hover:text-accent-teal-light transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6 animate-slide-up" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text mb-1">
                Username
              </label>
              <div className="mt-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-modern-light-text-secondary dark:text-modern-dark-text-secondary group-hover:text-accent-violet dark:group-hover:text-accent-violet-light transition-colors duration-200" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border-2 border-modern-light-input-border dark:border-modern-dark-input-border rounded-xl shadow-input dark:shadow-dark-input bg-modern-light-input dark:bg-modern-dark-input hover:bg-modern-light-input-hover dark:hover:bg-modern-dark-input-hover focus:border-accent-violet dark:focus:border-accent-violet-light placeholder-modern-light-text-secondary/40 dark:placeholder-modern-dark-text-secondary/40 text-modern-light-text dark:text-modern-dark-text focus:outline-none transition-all duration-200"
                  placeholder="Choose a username"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text mb-1">
                Email address
              </label>
              <div className="mt-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-modern-light-text-secondary dark:text-modern-dark-text-secondary group-hover:text-accent-violet dark:group-hover:text-accent-violet-light transition-colors duration-200" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border-2 border-modern-light-input-border dark:border-modern-dark-input-border rounded-xl shadow-input dark:shadow-dark-input bg-modern-light-input dark:bg-modern-dark-input hover:bg-modern-light-input-hover dark:hover:bg-modern-dark-input-hover focus:border-accent-violet dark:focus:border-accent-violet-light placeholder-modern-light-text-secondary/40 dark:placeholder-modern-dark-text-secondary/40 text-modern-light-text dark:text-modern-dark-text focus:outline-none transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text mb-1">
                Password
              </label>
              <div className="mt-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-modern-light-text-secondary dark:text-modern-dark-text-secondary group-hover:text-accent-violet dark:group-hover:text-accent-violet-light transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border-2 border-modern-light-input-border dark:border-modern-dark-input-border rounded-xl shadow-input dark:shadow-dark-input bg-modern-light-input dark:bg-modern-dark-input hover:bg-modern-light-input-hover dark:hover:bg-modern-dark-input-hover focus:border-accent-violet dark:focus:border-accent-violet-light placeholder-modern-light-text-secondary/40 dark:placeholder-modern-dark-text-secondary/40 text-modern-light-text dark:text-modern-dark-text focus:outline-none transition-all duration-200"
                  placeholder="Create a strong password"
                  minLength={6}
                />
              </div>
              <p className="mt-1 text-xs text-modern-light-text-secondary/70 dark:text-modern-dark-text-secondary/70">
                Must be at least 6 characters long
              </p>
            </div>
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text mb-1">
                University
              </label>
              <div className="mt-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <School className="h-5 w-5 text-modern-light-text-secondary dark:text-modern-dark-text-secondary group-hover:text-accent-violet dark:group-hover:text-accent-violet-light transition-colors duration-200" />
                </div>
                <input
                  id="university"
                  name="university"
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border-2 border-modern-light-input-border dark:border-modern-dark-input-border rounded-xl shadow-input dark:shadow-dark-input bg-modern-light-input dark:bg-modern-dark-input hover:bg-modern-light-input-hover dark:hover:bg-modern-dark-input-hover focus:border-accent-violet dark:focus:border-accent-violet-light placeholder-modern-light-text-secondary/40 dark:placeholder-modern-dark-text-secondary/40 text-modern-light-text dark:text-modern-dark-text focus:outline-none transition-all duration-200"
                  placeholder="Enter your university"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-accent-gradient-start to-accent-gradient-end hover:from-accent-violet hover:to-accent-rose focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-violet disabled:opacity-50 dark:from-accent-gradient-start-dark dark:to-accent-gradient-end-dark dark:hover:from-accent-violet-light dark:hover:to-accent-rose-light transition-all duration-200 shadow-soft hover:shadow-glow transform hover:-translate-y-0.5"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-white/70 group-hover:text-white/90" />
              </span>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 