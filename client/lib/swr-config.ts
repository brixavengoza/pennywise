import { SWRConfiguration } from 'swr';
import { getSession, signOut } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const swrConfig: SWRConfiguration = {
  fetcher: async (url: string) => {
    try {
      const session = await getSession();
      const token = (session as { accessToken?: string })?.accessToken;
      const sessionError = (session as { error?: string })?.error;
      
      // Don't make requests if session has permanent error
      if (sessionError === 'RefreshAccessTokenError') {
        const sessionErrorType = (session as { errorType?: string })?.errorType;
        // Only block if it's a permanent error
        if (sessionErrorType === 'REFRESH_TOKEN_EXPIRED' || 
            sessionErrorType === 'NO_REFRESH_TOKEN' || 
            sessionErrorType === 'MAX_RETRIES_EXCEEDED') {
          throw new Error('Session expired');
        }
        // For temporary errors, allow request to proceed (will trigger refresh)
      }
      
      const res = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        // Handle 401 Unauthorized
        if (res.status === 401) {
          const session = await getSession();
          const sessionError = (session as { error?: string; errorType?: string })?.error;
          const sessionErrorType = (session as { error?: string; errorType?: string })?.errorType;
          
          // Only logout if refresh token is expired or max retries exceeded
          if (sessionError === 'RefreshAccessTokenError' && 
              (sessionErrorType === 'REFRESH_TOKEN_EXPIRED' || 
               sessionErrorType === 'NO_REFRESH_TOKEN' || 
               sessionErrorType === 'MAX_RETRIES_EXCEEDED')) {
            await signOut({ redirect: false });
            throw new Error('Unauthorized - please log in again');
          } else if (sessionError === 'RefreshAccessTokenError') {
            // Trigger background refresh
            getSession().catch(() => {
              // Ignore errors, will retry on next request
            });
            throw new Error('Session expired - refreshing...');
          }
          
          throw new Error('Unauthorized - please log in again');
        }
        
        const errorText = await res.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || 'An error occurred' };
        }
        throw new Error(error.error || 'An error occurred');
      }

      const text = await res.text();
      if (!text) {
        return null;
      }
      
      return JSON.parse(text);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  },
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: (error) => {
    // Don't retry on 401 errors
    if (error?.message?.includes('Unauthorized')) {
      return false;
    }
    return true;
  },
  errorRetryCount: 3,
};

export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
