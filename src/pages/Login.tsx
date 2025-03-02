import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting to sign in with email:', email);
      
      // First, check if the user exists and is confirmed
      const { data: { user: existingUser }, error: getUserError } = await supabase.auth.getUser();
      console.log('Existing user check:', { existingUser, getUserError });

      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in attempt:', {
        success: !error,
        error,
        user: data?.user,
        session: data?.session
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          // Try to resend confirmation email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
          });
          
          if (resendError) {
            console.error('Error resending confirmation:', resendError);
            throw new Error('Failed to resend confirmation email. Please try again.');
          }
          
          throw new Error('Please check your email for a new confirmation link. If you already confirmed, try again in a few minutes.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Check if the user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('Profile check:', { profile, profileError });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('Unable to find user profile. Please try registering first.');
      }

      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in bg-modern-light-bg dark:bg-modern-dark-bg">
      <div className="max-w-md w-full space-y-8 bg-modern-light-card dark:bg-modern-dark-card p-8 rounded-2xl shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-dark-card-hover border-2 border-modern-light-border dark:border-modern-dark-border transition-all duration-300">
        <div className="space-y-3">
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-accent-gradient-start to-accent-gradient-end bg-clip-text text-transparent dark:from-accent-gradient-start-dark dark:to-accent-gradient-end-dark">
            Welcome back
          </h2>
          <p className="text-center text-sm text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-accent-violet hover:text-accent-teal dark:text-accent-violet-light dark:hover:text-accent-teal-light transition-colors duration-200">
              Sign up for free
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6 animate-slide-up" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border-2 border-modern-light-input-border dark:border-modern-dark-input-border rounded-xl shadow-input dark:shadow-dark-input bg-modern-light-input dark:bg-modern-dark-input hover:bg-modern-light-input-hover dark:hover:bg-modern-dark-input-hover focus:border-accent-violet dark:focus:border-accent-violet-light placeholder-modern-light-text-secondary/40 dark:placeholder-modern-dark-text-secondary/40 text-modern-light-text dark:text-modern-dark-text focus:outline-none transition-all duration-200"
                  placeholder="Enter your password"
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
                <LogIn className="h-5 w-5 text-white/70 group-hover:text-white/90" />
              </span>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 