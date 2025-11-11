/**
 * Authentication Hook
 * 
 * Custom hook for managing authentication state and actions
 */

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { getApiUrl } from '@/lib/api';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === 'authenticated' && !(session as { error?: string })?.error;
  const isLoading = status === 'loading';
  const sessionError = (session as { error?: string })?.error;
  const sessionErrorType = (session as { errorType?: string })?.errorType;

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        // Try to get error message from backend first
        const backendResponse = await fetch(getApiUrl('/api/auth/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const backendData = await backendResponse.json();

        // If backend returns error, use that message
        if (!backendResponse.ok || !backendData.success) {
          return {
            success: false,
            error: backendData.error || 'Invalid email or password',
          };
        }

        // If backend is OK, proceed with NextAuth signIn
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/'); // Redirect to root (dashboard)
          return { success: true };
        }

        // Fallback error message
        return {
          success: false,
          error: backendData.error || 'Invalid email or password',
        };
      } catch (error) {
        // Network or CORS errors
        console.error('Login error:', error);
        return {
          success: false,
          error: 'An unexpected error occurred',
        };
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/login');
  }, [router]);

  return {
    user: session?.user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    accessToken: (session as { accessToken?: string })?.accessToken,
    sessionError,
    sessionErrorType,
  };
}

