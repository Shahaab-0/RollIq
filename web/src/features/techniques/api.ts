import { apiClient } from '@/lib/apiClient';
import type { NewTechnique, Technique } from './types';

export async function listTechniques(): Promise<Technique[]> {
  return apiClient.get<Technique[]>('/techniques');
}

export async function createTechnique(technique: NewTechnique): Promise<Technique> {
  return apiClient.post<Technique>('/techniques', technique);
}

export async function updateTechnique(id: string, changes: Partial<NewTechnique>): Promise<Technique> {
  return apiClient.patch<Technique>(`/techniques/${id}`, changes);
}

export async function incrementDrillCount(id: string): Promise<Technique> {
  return apiClient.post<Technique>(`/techniques/${id}/drill`);
}

export async function deleteTechnique(id: string): Promise<void> {
  await apiClient.delete(`/techniques/${id}`);
}
