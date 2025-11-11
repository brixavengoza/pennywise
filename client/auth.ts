import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { refreshAccessToken, isTokenExpired } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function refreshAccessTokenWrapper(token: JWT): Promise<JWT> {
  const refreshToken = token.refreshToken as string;
  
  if (!refreshToken) {
    return { 
      ...token, 
      error: 'RefreshAccessTokenError', 
      errorType: 'NO_REFRESH_TOKEN' as const 
    };
  }


  if (isTokenExpired(refreshToken)) {
    return { 
      ...token, 
      error: 'RefreshAccessTokenError', 
      errorType: 'REFRESH_TOKEN_EXPIRED' as const 
    };
  }
  
  const refreshAttempts = (token.refreshAttempts as number) || 0;
  const lastRefreshAttempt = token.lastRefreshAttempt as number | undefined;
  
  const cooldown = refreshAttempts > 0 ? 10000 : 0; 
  if (lastRefreshAttempt && Date.now() - lastRefreshAttempt < cooldown) {
    
    return token;
  }
  
  token.lastRefreshAttempt = Date.now();
  token.refreshAttempts = refreshAttempts + 1;
  
  if (refreshAttempts >= 5) {
    return { 
      ...token, 
      error: 'RefreshAccessTokenError', 
      errorType: 'MAX_RETRIES_EXCEEDED' as const 
    };
  }

  try {
    const refreshedTokens = await refreshAccessToken(refreshToken);
    
    if (refreshedTokens) {
      let expiresAt: number;
      try {
        const payload = JSON.parse(atob(refreshedTokens.accessToken.split('.')[1]));
        expiresAt = payload.exp * 1000; 
      } catch {
        expiresAt = Date.now() + 1 * 60 * 1000;
      }

      return {
        ...token,
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
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
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    return { 
      ...token, 
      error: 'RefreshAccessTokenError', 
      errorType: 'REFRESH_FAILED' as const 
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
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
              email: credentials.email as string,
              password: credentials.password as string,
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
            } as User;
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
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.accessToken = (user as User & { accessToken?: string }).accessToken;
        token.refreshToken = (user as User & { refreshToken?: string }).refreshToken;
        token.id = user.id;
        
        const accessToken = (user as User & { accessToken?: string }).accessToken;
        if (accessToken) {
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const exp = payload.exp * 1000; 
            token.accessTokenExpires = exp;
          } catch {
            token.accessTokenExpires = Date.now() + 1 * 60 * 1000;
          }
        } else {
          token.accessTokenExpires = Date.now() + 1 * 60 * 1000;
        }
        token.refreshAttempts = 0;
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

      return await refreshAccessTokenWrapper(token);
    },
    async session({ session, token }): Promise<Session> {
      if (token) {
        session.user = {
          id: token.id as string,
          email: (token.email as string) || '',
          name: (token.name as string) || '',
          emailVerified: null, 
        };
        session.accessToken = token.accessToken as string;
        
        if (token.error) {
          session.error = token.error as string;
          session.errorType = token.errorType as 'REFRESH_TOKEN_EXPIRED' | 'NO_REFRESH_TOKEN' | 'MAX_RETRIES_EXCEEDED' | 'REFRESH_FAILED';
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
});

