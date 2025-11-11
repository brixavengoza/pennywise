import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    const token = (session as { accessToken?: string })?.accessToken;
    const sessionError = (session as { error?: string; errorType?: string })?.error;
    const sessionErrorType = (session as { error?: string; errorType?: string })?.errorType;

    // Only block requests if it's a permanent error
    if (sessionError === 'RefreshAccessTokenError' && 
        (sessionErrorType === 'REFRESH_TOKEN_EXPIRED' || 
         sessionErrorType === 'NO_REFRESH_TOKEN' || 
         sessionErrorType === 'MAX_RETRIES_EXCEEDED')) {
      // Redirect to login will be handled by DashboardLayout
      return Promise.reject(new Error('Session expired'));
    }

    // For temporary errors, allow request to proceed (will trigger refresh)
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
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - token may be expired');
      
      // Check if session has error
      const session = await getSession();
      const sessionError = (session as { error?: string; errorType?: string })?.error;
      const sessionErrorType = (session as { error?: string; errorType?: string })?.errorType;
      
      // Only logout if refresh token is expired or max retries exceeded
      if (sessionError === 'RefreshAccessTokenError' && 
          (sessionErrorType === 'REFRESH_TOKEN_EXPIRED' || 
           sessionErrorType === 'NO_REFRESH_TOKEN' || 
           sessionErrorType === 'MAX_RETRIES_EXCEEDED')) {
        await signOut({ redirect: false });
      } else if (sessionError === 'RefreshAccessTokenError') {
        // Trigger background refresh by calling getSession
        getSession().catch(() => {
          // Ignore errors, will retry on next request
        });
      }
    }
    return Promise.reject(error);
  }
);
