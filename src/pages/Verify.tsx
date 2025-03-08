import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function Verify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 20; // Increase max attempts

    const handleVerification = async () => {
      try {
        // Get the pending registration data
        const pendingRegistrationStr = localStorage.getItem('pendingRegistration');
        if (!pendingRegistrationStr) {
          console.log('No pending registration found');
          setError('No registration data found. Please try registering again.');
          return;
        }

        const pendingRegistration = JSON.parse(pendingRegistrationStr);
        console.log('Found pending registration:', pendingRegistration);

        // First, try to sign in with the stored credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: pendingRegistration.email,
          password: localStorage.getItem('tempPassword') || ''
        });

        if (signInError) {
          console.log('Sign in failed, checking session...');
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log('No session found, retrying...', attempts);
          attempts++;
          if (attempts < maxAttempts) {
            // Retry after 1 second
            timeoutId = setTimeout(handleVerification, 1000);
            return;
          } else {
            throw new Error('Unable to verify email. Please try again.');
          }
        }

        console.log('Session found:', session);
        console.log('Checking if profile exists for user:', session.user.id);

        // Check if profile already exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileCheckError) {
          console.error('Profile check error:', profileCheckError);
          throw profileCheckError;
        }

        if (existingProfile) {
          console.log('Profile already exists:', existingProfile);
          localStorage.removeItem('pendingRegistration');
          localStorage.removeItem('tempPassword');
          toast.success('Email verified successfully!');
          navigate('/login');
          return;
        }

        console.log('Creating profile for user:', session.user.id);
        console.log('Registration data:', pendingRegistration);

        // Create the user profile
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: session.user.id,
            username: pendingRegistration.username,
            university: pendingRegistration.university,
            created_at: new Date().toISOString(),
            role: 'user'
          }])
          .select()
          .maybeSingle();

        if (profileError || !newProfile) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile. Please try registering again.');
        }

        console.log('Profile created successfully:', newProfile);

        // Clear the stored data
        localStorage.removeItem('pendingRegistration');
        localStorage.removeItem('tempPassword');

        // Sign out after profile creation to ensure clean state
        await supabase.auth.signOut();

        toast.success('Email verified and profile created successfully!');
        navigate('/login');
      } catch (error: any) {
        console.error('Verification error:', error);
        setError(error.message || 'Failed to verify email or create profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Start the verification process
    handleVerification();

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-modern-light-bg dark:bg-modern-dark-bg">
        <div className="max-w-md w-full space-y-8 bg-modern-light-card dark:bg-modern-dark-card p-8 rounded-2xl shadow-card dark:shadow-dark-card">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Verification Failed</h2>
            <p className="text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
              {error}
            </p>
            <button
              onClick={() => navigate('/register')}
              className="mt-6 px-4 py-2 bg-accent-violet text-white rounded-lg hover:bg-accent-violet-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-modern-light-bg dark:bg-modern-dark-bg">
      <div className="max-w-md w-full space-y-8 bg-modern-light-card dark:bg-modern-dark-card p-8 rounded-2xl shadow-card dark:shadow-dark-card">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {loading && (
              <Loader2 className="h-12 w-12 text-accent-violet dark:text-accent-violet-light animate-spin" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-modern-light-text dark:text-modern-dark-text">
            {loading ? 'Verifying your email...' : 'Verification complete!'}
          </h2>
          <p className="mt-2 text-modern-light-text-secondary dark:text-modern-dark-text-secondary">
            {loading
              ? 'Please wait while we verify your email and set up your account.'
              : 'You can now sign in to your account.'}
          </p>
        </div>
      </div>
    </div>
  );
} 