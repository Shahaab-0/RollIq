import { apiClient } from '@/lib/apiClient';
import type { NewSession, Session } from './types';

export async function listSessions(): Promise<Session[]> {
  return apiClient.get<Session[]>('/sessions');
}

export async function createSession(session: NewSession): Promise<Session> {
  return apiClient.post<Session>('/sessions', session);
}

export async function updateSession(id: string, changes: Partial<NewSession>): Promise<Session> {
  return apiClient.patch<Session>(`/sessions/${id}`, changes);
}

export async function deleteSession(id: string): Promise<void> {
  await apiClient.delete(`/sessions/${id}`);
}
