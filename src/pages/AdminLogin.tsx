import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'admin@studynotes.com';
const ADMIN_PASSWORD = 'Admin@123';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createAdminUser = async () => {
    try {
      // Try to sign up the admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            role: 'admin'
          }
        }
      });

      if (signUpError) {
        console.error('Admin creation error:', signUpError);
        return false;
      }

      if (signUpData.user) {
        // Create admin profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signUpData.user.id,
            username: 'admin',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return false;
        }

        return true;
      }
    } catch (error) {
      console.error('Admin creation failed:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try to sign in
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If login fails and it's the admin email, try to create the admin user
      if (error && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        console.log('Attempting to create admin user...');
        const created = await createAdminUser();
        if (created) {
          // Try signing in again
          ({ data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          }));
        }
      }

      if (error) {
        console.error('Sign in error:', error);
        throw new Error('Invalid email or password');
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      console.log('Successfully signed in. User ID:', data.user.id);

      // Check if user has admin role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      console.log('Profile data:', profileData);

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Could not verify admin status');
      }

      if (profileData?.role !== 'admin') {
        // Sign out if not admin
        await supabase.auth.signOut();
        throw new Error('This account does not have admin privileges');
      }

      // If we get here, the user is authenticated and is an admin
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminId', data.user.id);
      navigate('/admin/dashboard');
      toast.success('Successfully logged in as admin');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminId');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-modern-light-card dark:bg-modern-dark-card border border-modern-light-border dark:border-modern-dark-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-center mb-8">
            <Shield className="w-12 h-12 text-accent-violet dark:text-accent-violet-light" />
          </div>
          
          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-accent-violet to-accent-teal bg-clip-text text-transparent mb-6">
            Admin Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-modern-light-text/70 dark:text-modern-dark-text/70 mb-1">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-modern-light-text/50 dark:text-modern-dark-text/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-modern-light-border dark:border-modern-dark-border bg-modern-light-bg dark:bg-modern-dark-bg text-modern-light-text dark:text-modern-dark-text"
                  required
                  placeholder={ADMIN_EMAIL}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-modern-light-text/70 dark:text-modern-dark-text/70 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-modern-light-text/50 dark:text-modern-dark-text/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-modern-light-border dark:border-modern-dark-border bg-modern-light-bg dark:bg-modern-dark-bg text-modern-light-text dark:text-modern-dark-text"
                  required
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg font-medium text-white bg-accent-violet hover:bg-accent-violet-dark dark:bg-accent-violet-light dark:hover:bg-accent-violet disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                'Login as Admin'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-modern-light-text/50 dark:text-modern-dark-text/50">
              This page is restricted to administrators only.
            </p>
            <p className="text-xs text-modern-light-text/30 dark:text-modern-dark-text/30 mt-2">
              Default credentials: {ADMIN_EMAIL} / {ADMIN_PASSWORD}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 