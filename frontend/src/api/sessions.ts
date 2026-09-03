import { apiClient } from './client';
import type { NewSession, Session } from '../features/trainingLog/types';

export async function listSessions(): Promise<Session[]> {
  const { data } = await apiClient.get<Session[]>('/sessions');
  return data;
}

export async function createSession(session: NewSession): Promise<Session> {
  const { data } = await apiClient.post<Session>('/sessions', session);
  return data;
}

export async function updateSession(
  id: string,
  changes: Partial<NewSession>,
): Promise<Session> {
  const { data } = await apiClient.patch<Session>(`/sessions/${id}`, changes);
  return data;
}

export async function deleteSession(id: string): Promise<void> {
  await apiClient.delete(`/sessions/${id}`);
}

export async function getSessionTechniques(
  sessionId: string,
): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(
    `/sessions/${sessionId}/techniques`,
  );
  return data;
}

export async function replaceSessionTechniques(
  sessionId: string,
  techniqueIds: string[],
): Promise<void> {
  await apiClient.put(`/sessions/${sessionId}/techniques`, {
    technique_ids: techniqueIds,
  });
}
