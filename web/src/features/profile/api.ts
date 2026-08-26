import { apiClient } from '@/lib/apiClient';
import type { Belt, BeltPromotion, Profile } from './types';

export async function getProfile(): Promise<Profile> {
  return apiClient.get<Profile>('/profile/me');
}

export async function updateProfile(changes: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
  return apiClient.patch<Profile>('/profile/me', changes);
}

export async function listBeltPromotions(): Promise<BeltPromotion[]> {
  return apiClient.get<BeltPromotion[]>('/belt-promotions');
}

export async function createPromotion(promotion: {
  belt: Belt;
  promoted_on: string;
  notes?: string | null;
}): Promise<BeltPromotion> {
  return apiClient.post<BeltPromotion>('/belt-promotions', promotion);
}

export async function logMilestone(milestone: {
  belt: Belt;
  stripes: number;
  promoted_on?: string;
}): Promise<BeltPromotion> {
  return apiClient.post<BeltPromotion>('/belt-promotions/milestone', milestone);
}

export async function deletePromotion(id: string): Promise<void> {
  await apiClient.delete(`/belt-promotions/${id}`);
}
