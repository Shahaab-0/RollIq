import { apiClient } from './client';
import type { Profile } from '../features/profile/types';

export async function getProfile(): Promise<Profile> {
  const { data } = await apiClient.get<Profile>('/profile/me');
  return data;
}

export async function updateProfile(changes: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
  const { data } = await apiClient.patch<Profile>('/profile/me', changes);
  return data;
}
