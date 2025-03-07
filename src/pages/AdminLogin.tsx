import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

// Temporary admin credentials (CHANGE THESE IN PRODUCTION)
const ADMIN_EMAIL = 'admin@studynotes.com';
const ADMIN_PASSWORD = 'Admin@123';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if credentials match
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error('Invalid credentials');
      }

      // Sign in with Supabase
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If sign in fails, try to sign up first
        const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'admin'
            }
          }
        });

        if (signUpError) throw signUpError;

        // Create admin profile
        if (newUser) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: newUser.id,
              username: 'admin',
              role: 'admin'
            });

          if (profileError) throw profileError;
        }
      }

      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/dashboard');
      toast.success('Successfully logged in as admin');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
      localStorage.removeItem('isAdmin');
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
          </div>
        </div>
      </div>
    </div>
  );
} 