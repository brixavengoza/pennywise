import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    errorType?: 'REFRESH_TOKEN_EXPIRED' | 'NO_REFRESH_TOKEN' | 'MAX_RETRIES_EXCEEDED' | 'REFRESH_FAILED';
    user: {
      id: string;
      email: string;
      name: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    errorType?: 'REFRESH_TOKEN_EXPIRED' | 'NO_REFRESH_TOKEN' | 'MAX_RETRIES_EXCEEDED' | 'REFRESH_FAILED';
    refreshAttempts?: number;
    lastRefreshAttempt?: number;
    id?: string;
  }
}
