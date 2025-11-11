import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const requestRefreshAttempts = new Map<string, number>();
const MAX_REFRESH_RETRIES = 3;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
  timeout: 15000, // 15s
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    const token = (session as { accessToken?: string })?.accessToken;
    const sessionError = (session as { error?: string; errorType?: string })?.error;
    const sessionErrorType = (session as { error?: string; errorType?: string })?.errorType;

    // Only block requests if it's a permanent error (refresh token expired or max retries)
    if (sessionError === 'RefreshAccessTokenError' && 
        (sessionErrorType === 'REFRESH_TOKEN_EXPIRED' || 
         sessionErrorType === 'NO_REFRESH_TOKEN' || 
         sessionErrorType === 'MAX_RETRIES_EXCEEDED')) {
      // Session permanently invalid, logout
      return Promise.reject(new Error('Session expired'));
    }

    // Add token to request if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.url) {
      requestRefreshAttempts.delete(response.config.url);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest) {
      const requestUrl = originalRequest.url || 'unknown';
      const currentRetries = requestRefreshAttempts.get(requestUrl) || 0;

      if (currentRetries >= MAX_REFRESH_RETRIES) {
        console.error(`Max refresh retries (${MAX_REFRESH_RETRIES}) exceeded for ${requestUrl}`);
        requestRefreshAttempts.delete(requestUrl);
        
        // Force logout after max retries
        await signOut({ redirect: false });
        window.location.href = '/login';
        return Promise.reject(new Error('Authentication failed after multiple retries'));
      }

      requestRefreshAttempts.set(requestUrl, currentRetries + 1);
      
      console.log(`Expired token, refreshing (attempt ${currentRetries + 1}/${MAX_REFRESH_RETRIES})...`);

      try {
        const newSession = await getSession();
        const sessionError = (newSession as { error?: string; errorType?: string })?.error;
        const sessionErrorType = (newSession as { error?: string; errorType?: string })?.errorType;
        const newToken = (newSession as { accessToken?: string })?.accessToken;

        if (sessionError === 'RefreshAccessTokenError') {
          if (sessionErrorType === 'REFRESH_TOKEN_EXPIRED' || 
              sessionErrorType === 'NO_REFRESH_TOKEN' || 
              sessionErrorType === 'MAX_RETRIES_EXCEEDED') {

            console.error('Token refresh failed permanently:', sessionErrorType);
            requestRefreshAttempts.delete(requestUrl);
            await signOut({ redirect: false });
            window.location.href = '/login';
            return Promise.reject(new Error('Session expired permanently'));
          }
          
          console.warn('Token refresh failed temporarily, will retry on next request');
          await new Promise(resolve => setTimeout(resolve, 1000 * (currentRetries + 1))); // Exponential backoff
          return Promise.reject(error);
        }

        if (newToken) {
          console.log('Token refreshed successfully, retrying request...');
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          requestRefreshAttempts.delete(requestUrl);
          return apiClient(originalRequest);
        }
        
        console.error('No token available after refresh attempt');
        requestRefreshAttempts.delete(requestUrl);
        await signOut({ redirect: false });
        window.location.href = '/login';
        return Promise.reject(new Error('No authentication token'));
        
      } catch (refreshError) {
        console.error('Error during token refresh:', refreshError);
        requestRefreshAttempts.delete(requestUrl);
        await signOut({ redirect: false });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response && error.response.status === 403) {
      console.error('Forbidden - insufficient permissions');
    }

    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.status);
    }

    return Promise.reject(error);
  }
);

