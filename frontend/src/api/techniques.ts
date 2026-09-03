import { apiClient } from './client';
import type { NewTechnique, Technique } from '../features/techniques/types';

export async function listTechniques(): Promise<Technique[]> {
  const { data } = await apiClient.get<Technique[]>('/techniques');
  return data;
}

export async function createTechnique(
  technique: NewTechnique,
): Promise<Technique> {
  const { data } = await apiClient.post<Technique>('/techniques', technique);
  return data;
}

export async function updateTechnique(
  id: string,
  changes: Partial<NewTechnique>,
): Promise<Technique> {
  const { data } = await apiClient.patch<Technique>(
    `/techniques/${id}`,
    changes,
  );
  return data;
}

export async function incrementDrillCount(id: string): Promise<Technique> {
  const { data } = await apiClient.post<Technique>(`/techniques/${id}/drill`);
  return data;
}

export async function deleteTechnique(id: string): Promise<void> {
  await apiClient.delete(`/techniques/${id}`);
}

export async function importFundamentals(
  seeds: {
    name: string;
    position: string;
    notes: string;
    resource_url: string | null;
  }[],
): Promise<Technique[]> {
  const { data } = await apiClient.post<Technique[]>(
    '/techniques/import',
    seeds,
  );
  return data;
}
