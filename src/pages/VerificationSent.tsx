import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export default function VerificationSent() {
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-modern-light-bg dark:bg-modern-dark-bg">
      <div className="max-w-md w-full space-y-8 bg-modern-light-card dark:bg-modern-dark-card p-8 rounded-2xl shadow-card dark:shadow-dark-card">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-accent-violet/10 dark:bg-accent-violet-light/10">
              <Mail className="h-12 w-12 text-accent-violet dark:text-accent-violet-light" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-modern-light-text dark:text-modern-dark-text">
            Check your email
          </h2>
          <p className="mt-2 text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
            We've sent a verification link to <strong>{email}</strong>
          </p>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
              Click the link in the email to verify your account. If you don't see the email, check your spam folder.
            </p>
            <div className="pt-4 border-t border-modern-light-border dark:border-modern-dark-border">
              <p className="text-sm text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
                Already verified?{' '}
                <Link
                  to="/login"
                  className="font-medium text-accent-violet hover:text-accent-teal dark:text-accent-violet-light dark:hover:text-accent-teal-light transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 