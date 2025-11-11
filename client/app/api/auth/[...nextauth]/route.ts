import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';
import { refreshAccessToken, isTokenExpired } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Refresh access token wrapper following NextAuth best practices
 * Handles token refresh with retry logic and error categorization
 */
async function refreshAccessTokenWrapper(token: JWT): Promise<JWT> {
  const refreshToken = token.refreshToken as string;
  
  if (!refreshToken) {
    return { 
      ...token, 
      error: 'RefreshAccessTokenError', 
      errorType: 'NO_REFRESH_TOKEN' as const 
    } as JWT;
  }

  // Check if refresh token is also expired - this is permanent, should logout
  if (isTokenExpired(refreshToken)) {
    return { 
      ...token, 
      error: 'RefreshAccessTokenError', 
      errorType: 'REFRESH_TOKEN_EXPIRED' as const 
    } as JWT;
  }

  // Track refresh attempts
  const refreshAttempts = (token.refreshAttempts as number) || 0;
  const lastRefreshAttempt = token.lastRefreshAttempt as number | undefined;
  
  // Prevent too frequent refresh attempts (cooldown: 10 seconds for retries)
  const cooldown = refreshAttempts > 0 ? 10000 : 0; // 10s cooldown after first failure
  if (lastRefreshAttempt && Date.now() - lastRefreshAttempt < cooldown) {
    // Too soon to retry, return existing token
    return token;
  }

  // Update last refresh attempt timestamp and increment attempts
  token.lastRefreshAttempt = Date.now();
  token.refreshAttempts = refreshAttempts + 1;

  // Only retry up to 5 times before giving up
  if (refreshAttempts >= 5) {
    return { 
      ...token, 
      error: 'RefreshAccessTokenError', 
      errorType: 'MAX_RETRIES_EXCEEDED' as const 
    } as JWT;
  }

  try {
    const refreshedTokens = await refreshAccessToken(refreshToken);
    
    if (refreshedTokens) {
      // Calculate expiration from actual JWT token
      let expiresAt: number;
      try {
        const payload = JSON.parse(atob(refreshedTokens.accessToken.split('.')[1]));
        expiresAt = payload.exp * 1000; // Convert to milliseconds
      } catch {
        // Fallback to 1 minute if we can't parse JWT
        expiresAt = Date.now() + 1 * 60 * 1000;
      }

      return {
        ...token,
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // Fall back to old refresh token if new one not provided
        accessTokenExpires: expiresAt,
        error: undefined,
        errorType: undefined,
        lastRefreshAttempt: undefined,
        refreshAttempts: 0,
      };
    }

    // Refresh failed - return error but allow retry
    return { 
      ...token, 
      error: 'RefreshAccessTokenError', 
      errorType: 'REFRESH_FAILED' as const 
    } as JWT;
  } catch (error) {
    console.error('Error refreshing access token', error);
    return { 
      ...token, 
      error: 'RefreshAccessTokenError', 
      errorType: 'REFRESH_FAILED' as const 
    } as JWT;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const text = await res.text();
          let data;
          
          if (text) {
            try {
              data = JSON.parse(text);
            } catch {
              return null;
            }
          } else {
            return null;
          }

          if (!res.ok || !data.success) {
            return null;
          }
          
          if (data?.success && data?.user && data?.tokens) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              accessToken: data.tokens.accessToken,
              refreshToken: data.tokens.refreshToken,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | undefined }): Promise<JWT> {
      // Initial sign in - store tokens and set expiration
      if (user) {
        token.accessToken = (user as User).accessToken;
        token.refreshToken = (user as User).refreshToken;
        token.id = user.id;
        // Access token expires in 1 minute (for testing refresh token)
        // Calculate expiration from actual JWT token if available
        const accessToken = (user as User).accessToken;
        if (accessToken) {
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            token.accessTokenExpires = exp;
          } catch {
            // Fallback to 1 minute if we can't parse JWT
            token.accessTokenExpires = Date.now() + 1 * 60 * 1000;
          }
        } else {
          token.accessTokenExpires = Date.now() + 1 * 60 * 1000;
        }
        token.refreshAttempts = 0; // Reset refresh attempts
        return token;
      }

      // Return previous token if the access token has not expired yet
      const expiresAt = token.accessTokenExpires as number;
      if (Date.now() < expiresAt) {
        // Token is still valid, clear any previous errors
        if (token.error) {
          token.error = undefined;
          token.errorType = undefined;
          token.refreshAttempts = 0;
        }
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessTokenWrapper(token);
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
        };
        (session as Session).accessToken = token.accessToken as string;
        
        // Add error if token refresh failed
        if (token.error) {
          (session as Session & { error?: string; errorType?: 'REFRESH_TOKEN_EXPIRED' | 'NO_REFRESH_TOKEN' | 'MAX_RETRIES_EXCEEDED' | 'REFRESH_FAILED' }).error = token.error as string;
          (session as Session & { error?: string; errorType?: 'REFRESH_TOKEN_EXPIRED' | 'NO_REFRESH_TOKEN' | 'MAX_RETRIES_EXCEEDED' | 'REFRESH_FAILED' }).errorType = token.errorType;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days (matches refresh token expiration)
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
};

// NextAuth v5 returns an object with handlers
const { handlers } = NextAuth(authOptions);

export const { GET, POST } = handlers;

