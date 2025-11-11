/**
 * API Utilities
 * 
 * Helper functions for making API requests
 */

import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get API URL with endpoint
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Get auth headers with access token
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  return headers;
}

/**
 * Make authenticated API request
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  const text = await response.text();
  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

