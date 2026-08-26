import { apiClient, requestLocal } from '@/lib/apiClient';
import type { AuthUser } from './types';

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const { user } = await requestLocal<{ user: AuthUser }>('POST', '/api/auth/signup', {
    email,
    password,
  });
  return user;
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const { user } = await requestLocal<{ user: AuthUser }>('POST', '/api/auth/signin', {
    email,
    password,
  });
  return user;
}

export async function signOut(): Promise<void> {
  await requestLocal('POST', '/api/auth/signout');
}

export async function getMe(): Promise<AuthUser> {
  return apiClient.get<AuthUser>('/auth/me');
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('/account');
}
