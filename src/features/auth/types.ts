export type AuthStatus = 'idle' | 'loading' | 'ready';

export interface AuthCredentials {
  email: string;
  password: string;
}
