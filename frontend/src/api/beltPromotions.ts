import { apiClient } from './client';
import type { Belt, BeltPromotion } from '../features/profile/types';

export async function listBeltPromotions(): Promise<BeltPromotion[]> {
  const { data } = await apiClient.get<BeltPromotion[]>('/belt-promotions');
  return data;
}

export async function createPromotion(promotion: {
  belt: Belt;
  promoted_on: string;
  notes?: string | null;
}): Promise<BeltPromotion> {
  const { data } = await apiClient.post<BeltPromotion>(
    '/belt-promotions',
    promotion,
  );
  return data;
}

export async function logMilestone(milestone: {
  belt: Belt;
  stripes: number;
  promoted_on?: string;
}): Promise<BeltPromotion> {
  const { data } = await apiClient.post<BeltPromotion>(
    '/belt-promotions/milestone',
    milestone,
  );
  return data;
}

export async function deletePromotion(id: string): Promise<void> {
  await apiClient.delete(`/belt-promotions/${id}`);
}
