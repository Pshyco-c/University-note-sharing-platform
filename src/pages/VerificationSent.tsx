import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerificationSent() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in bg-modern-light-bg dark:bg-modern-dark-bg">
      <div className="max-w-md w-full space-y-8 bg-modern-light-card dark:bg-modern-dark-card p-8 rounded-2xl shadow-card dark:shadow-dark-card border-2 border-modern-light-border dark:border-modern-dark-border transition-all duration-300">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent-violet/10 dark:bg-accent-violet-light/10 p-4">
              <Mail className="h-12 w-12 text-accent-violet dark:text-accent-violet-light" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-modern-light-text dark:text-modern-dark-text">
            Verification Email Sent
          </h2>
          
          <div className="space-y-4">
            <p className="text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
              We've sent a verification email to:
            </p>
            <p className="font-medium text-modern-light-text dark:text-modern-dark-text bg-modern-light-accent dark:bg-modern-dark-accent py-2 px-4 rounded-lg">
              {email}
            </p>
            <p className="text-modern-light-text-secondary dark:text-modern-dark-text-secondary text-sm">
              Please check your inbox and click on the verification link to complete your registration.
              If you don't see the email, check your spam folder.
            </p>
          </div>
          
          <div className="pt-4">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-accent-violet dark:text-accent-violet-light hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 