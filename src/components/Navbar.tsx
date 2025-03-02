import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Menu, X, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <nav className="bg-modern-light-card/80 dark:bg-modern-dark-card/80 border-b border-modern-light-border dark:border-modern-dark-border backdrop-blur-sm transition-all duration-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 group">
              <BookOpen className="h-8 w-8 text-accent-violet dark:text-accent-violet-light transform group-hover:scale-105 transition-transform duration-200" />
              <span className="text-xl font-bold bg-gradient-to-r from-accent-violet to-accent-teal bg-clip-text text-transparent">StudyNotes</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-modern-light-text-secondary dark:text-modern-dark-text-secondary hover:text-accent-violet dark:hover:text-accent-violet-light px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-modern-light-accent dark:hover:bg-modern-dark-accent"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-accent-violet to-accent-teal hover:from-accent-violet hover:to-accent-rose transition-all duration-200 shadow-soft hover:shadow-glow transform hover:-translate-y-0.5"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-modern-light-text-secondary dark:text-modern-dark-text-secondary hover:text-accent-violet dark:hover:text-accent-violet-light px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-modern-light-accent dark:hover:bg-modern-dark-accent"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-accent-violet to-accent-teal hover:from-accent-violet hover:to-accent-rose transition-all duration-200 shadow-soft hover:shadow-glow transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 ml-2 rounded-xl text-modern-light-text-secondary dark:text-modern-dark-text-secondary hover:text-accent-violet dark:hover:text-accent-violet-light hover:bg-modern-light-accent dark:hover:bg-modern-dark-accent transition-all duration-200"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-3 animate-slide-up">
            {user ? (
              <div className="space-y-1">
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-xl text-base font-medium text-modern-light-text-secondary dark:text-modern-dark-text-secondary hover:text-accent-violet dark:hover:text-accent-violet-light hover:bg-modern-light-accent dark:hover:bg-modern-dark-accent transition-all duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-modern-light-text-secondary dark:text-modern-dark-text-secondary hover:text-accent-violet dark:hover:text-accent-violet-light hover:bg-modern-light-accent dark:hover:bg-modern-dark-accent transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-xl text-base font-medium text-modern-light-text-secondary dark:text-modern-dark-text-secondary hover:text-accent-violet dark:hover:text-accent-violet-light hover:bg-modern-light-accent dark:hover:bg-modern-dark-accent transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-xl text-base font-medium text-modern-light-text-secondary dark:text-modern-dark-text-secondary hover:text-accent-violet dark:hover:text-accent-violet-light hover:bg-modern-light-accent dark:hover:bg-modern-dark-accent transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}