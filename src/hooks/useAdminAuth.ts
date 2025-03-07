import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    function checkAdminStatus() {
      try {
        const isAdminUser = localStorage.getItem('isAdmin') === 'true';
        
        if (!isAdminUser) {
          throw new Error('Not an admin user');
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
        localStorage.removeItem('isAdmin');
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [navigate]);

  return { isAdmin, isLoading };
} 