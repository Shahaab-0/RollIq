import { apiClient } from './client';
import type { Session } from '../features/auth/types';

interface AuthResponseDto {
  user: { id: string; email: string };
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

function toSession(dto: AuthResponseDto): Session {
  return {
    user: dto.user,
    accessToken: dto.access_token,
    refreshToken: dto.refresh_token,
    expiresAt: dto.expires_at,
  };
}

export async function signUp(email: string, password: string): Promise<Session> {
  const { data } = await apiClient.post<AuthResponseDto>('/auth/signup', { email, password });
  return toSession(data);
}

export async function signIn(email: string, password: string): Promise<Session> {
  const { data } = await apiClient.post<AuthResponseDto>('/auth/signin', { email, password });
  return toSession(data);
}

export async function refresh(refreshToken: string): Promise<Session> {
  const { data } = await apiClient.post<AuthResponseDto>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return toSession(data);
}

export async function signOut(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/signout', { refresh_token: refreshToken });
}

export async function me(): Promise<{ id: string; email: string }> {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post('/auth/reset-password', {
    email,
    code,
    new_password: newPassword,
  });
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('/account');
}
