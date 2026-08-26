import { apiClient } from './client';
import type { Injury, NewInjury } from '../features/injuries/types';

export async function listInjuries(): Promise<Injury[]> {
  const { data } = await apiClient.get<Injury[]>('/injuries');
  return data;
}

export async function createInjury(injury: NewInjury): Promise<Injury> {
  const { data } = await apiClient.post<Injury>('/injuries', injury);
  return data;
}

export async function updateInjury(id: string, changes: Partial<NewInjury>): Promise<Injury> {
  const { data } = await apiClient.patch<Injury>(`/injuries/${id}`, changes);
  return data;
}

export async function deleteInjury(id: string): Promise<void> {
  await apiClient.delete(`/injuries/${id}`);
}
