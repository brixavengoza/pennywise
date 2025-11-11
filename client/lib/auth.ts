/**
 * Authentication Utilities
 * 
 * Helper functions for token management and refresh logic
 * 
 * Note: We don't store tokens in localStorage for security reasons.
 * NextAuth handles token storage securely via HTTP-only cookies.
 */

import { getApiUrl } from './api';

/**
 * Refresh access token using refresh token from NextAuth session
 * This is called automatically by NextAuth when the access token expires
 * Max retries: 3 attempts
 */
export async function refreshAccessToken(
  refreshToken: string,
  retryCount = 0,
  maxRetries = 3
): Promise<{ accessToken: string; refreshToken: string } | null> {
  // Stop retrying after max attempts
  if (retryCount >= maxRetries) {
    console.error(`Failed to refresh token after ${maxRetries} attempts. Stopping retries.`);
    return null;
  }

  try {
    const response = await fetch(getApiUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Unknown error' };
      }
      
      console.error(`Token refresh failed (attempt ${retryCount + 1}):`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error || 'Unknown error',
        errorData,
      });
      
      // Only retry on network errors (5xx), not auth errors (4xx)
      if (response.status >= 500 && retryCount < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return refreshAccessToken(refreshToken, retryCount + 1, maxRetries);
      }
      return null;
    }

    const result = await response.json();

    if (result.success && result.tokens) {
      console.log('Token refresh successful');
      return {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      };
    }

    console.error('Token refresh response missing tokens:', result);
    return null;
  } catch (error) {
    const errorObj = error as { code?: string; name?: string; message?: string };
    console.error(`Token refresh error (attempt ${retryCount + 1}):`, {
      code: errorObj?.code,
      name: errorObj?.name,
      message: errorObj?.message,
      error,
    });
    
    // Only retry on network errors (ECONNREFUSED, ETIMEDOUT), not other errors
    if (
      (errorObj?.code === 'ECONNREFUSED' || errorObj?.code === 'ETIMEDOUT' || errorObj?.name === 'AbortError') &&
      retryCount < maxRetries - 1
    ) {
      console.warn(`Token refresh attempt ${retryCount + 1} failed, retrying... (${errorObj?.code || errorObj?.name})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return refreshAccessToken(refreshToken, retryCount + 1, maxRetries);
    }
    
    console.error(`Failed to refresh token after ${retryCount + 1} attempt(s):`, error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
}
