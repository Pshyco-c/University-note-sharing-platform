import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Get the hash fragment from the URL
        const hash = location.hash;
        
        // If there's no hash, the user might have navigated here directly
        if (!hash) {
          setVerifying(false);
          setError('No verification token found. Please check your email for the verification link.');
          return;
        }

        console.log('Processing verification with hash:', hash);
        
        // The hash contains the access_token and other parameters
        // Supabase's detectSessionInUrl will handle this automatically
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Verification error:', error);
          setError(error.message);
          setSuccess(false);
        } else if (data.session) {
          console.log('User verified and session created:', data.session);
          setSuccess(true);
          
          // Wait a moment before redirecting to login
          setTimeout(() => {
            toast.success('Email verified successfully! You can now log in.');
            navigate('/login');
          }, 2000);
        } else {
          console.log('No session found after verification');
          setError('Verification failed. The link may have expired.');
          setSuccess(false);
        }
      } catch (err: any) {
        console.error('Error during verification:', err);
        setError(err.message || 'An unexpected error occurred');
        setSuccess(false);
      } finally {
        setVerifying(false);
      }
    };

    handleVerification();
  }, [location, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in bg-modern-light-bg dark:bg-modern-dark-bg">
      <div className="max-w-md w-full space-y-8 bg-modern-light-card dark:bg-modern-dark-card p-8 rounded-2xl shadow-card dark:shadow-dark-card border-2 border-modern-light-border dark:border-modern-dark-border transition-all duration-300">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-modern-light-text dark:text-modern-dark-text">
            Email Verification
          </h2>
          
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {verifying ? (
              <>
                <Loader className="h-16 w-16 text-accent-violet dark:text-accent-violet-light animate-spin" />
                <p className="text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
                  Verifying your email...
                </p>
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400" />
                <p className="text-modern-light-text dark:text-modern-dark-text font-medium">
                  Your email has been verified!
                </p>
                <p className="text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
                  Redirecting you to login...
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-500 dark:text-red-400" />
                <p className="text-modern-light-text dark:text-modern-dark-text font-medium">
                  Verification Failed
                </p>
                <p className="text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
                  {error || 'An error occurred during verification.'}
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 px-4 py-2 bg-accent-violet hover:bg-accent-violet/90 text-white rounded-lg transition-colors"
                >
                  Go to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 