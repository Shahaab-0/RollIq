import { apiClient } from '@/lib/apiClient';
import type { NewRoll, PartnerHistoryEntry, Roll } from './types';

export async function listRolls(): Promise<Roll[]> {
  return apiClient.get<Roll[]>('/rolls');
}

export async function createRoll(roll: NewRoll): Promise<Roll> {
  return apiClient.post<Roll>('/rolls', roll);
}

export async function updateRoll(id: string, changes: Partial<NewRoll>): Promise<Roll> {
  return apiClient.patch<Roll>(`/rolls/${id}`, changes);
}

export async function deleteRoll(id: string): Promise<void> {
  await apiClient.delete(`/rolls/${id}`);
}

export async function listPartnerHistory(): Promise<PartnerHistoryEntry[]> {
  return apiClient.get<PartnerHistoryEntry[]>('/rolls/partners');
}
