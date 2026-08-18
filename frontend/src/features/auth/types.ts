export type AuthStatus = 'idle' | 'loading' | 'ready';

export interface AuthCredentials {
  email: string;
  password: string;
}

// Backed by our own JWT + refresh token issued by the Spring Boot API.
export interface Session {
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
