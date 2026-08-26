import { apiClient } from '@/lib/apiClient';
import type { Injury, NewInjury } from './types';

export async function listInjuries(): Promise<Injury[]> {
  return apiClient.get<Injury[]>('/injuries');
}

export async function createInjury(injury: NewInjury): Promise<Injury> {
  return apiClient.post<Injury>('/injuries', injury);
}

export async function updateInjury(id: string, changes: Partial<NewInjury>): Promise<Injury> {
  return apiClient.patch<Injury>(`/injuries/${id}`, changes);
}

export async function deleteInjury(id: string): Promise<void> {
  await apiClient.delete(`/injuries/${id}`);
}
