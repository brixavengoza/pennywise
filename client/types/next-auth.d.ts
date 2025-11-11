declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
    accessToken: string;
    error?: string;
    errorType?: 'REFRESH_TOKEN_EXPIRED' | 'NO_REFRESH_TOKEN' | 'MAX_RETRIES_EXCEEDED' | 'REFRESH_FAILED';
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires?: number;
    refreshAttempts?: number;
    lastRefreshAttempt?: number;
    error?: string;
    errorType?: 'REFRESH_TOKEN_EXPIRED' | 'NO_REFRESH_TOKEN' | 'MAX_RETRIES_EXCEEDED' | 'REFRESH_FAILED';
  }
}

