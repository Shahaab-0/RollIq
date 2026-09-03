import { apiClient } from './client';
import type {
  NewRoll,
  PartnerHistoryEntry,
  Roll,
} from '../features/rolls/types';

export async function listRolls(): Promise<Roll[]> {
  const { data } = await apiClient.get<Roll[]>('/rolls');
  return data;
}

export async function createRoll(roll: NewRoll): Promise<Roll> {
  const { data } = await apiClient.post<Roll>('/rolls', roll);
  return data;
}

export async function updateRoll(
  id: string,
  changes: Partial<NewRoll>,
): Promise<Roll> {
  const { data } = await apiClient.patch<Roll>(`/rolls/${id}`, changes);
  return data;
}

export async function deleteRoll(id: string): Promise<void> {
  await apiClient.delete(`/rolls/${id}`);
}

export async function listPartnerHistory(): Promise<PartnerHistoryEntry[]> {
  const { data } = await apiClient.get<PartnerHistoryEntry[]>(
    '/rolls/partners',
  );
  return data;
}
