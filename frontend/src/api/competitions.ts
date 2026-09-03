import { apiClient } from './client';
import type {
  Competition,
  CompetitionMatch,
  NewCompetition,
  NewCompetitionMatch,
} from '../features/competitions/types';

export async function listCompetitions(): Promise<Competition[]> {
  const { data } = await apiClient.get<Competition[]>('/competitions');
  return data;
}

export async function createCompetition(
  competition: NewCompetition,
): Promise<Competition> {
  const { data } = await apiClient.post<Competition>(
    '/competitions',
    competition,
  );
  return data;
}

export async function updateCompetition(
  id: string,
  changes: Partial<NewCompetition>,
): Promise<Competition> {
  const { data } = await apiClient.patch<Competition>(
    `/competitions/${id}`,
    changes,
  );
  return data;
}

export async function deleteCompetition(id: string): Promise<void> {
  await apiClient.delete(`/competitions/${id}`);
}

export async function listMatches(
  competitionId: string,
): Promise<CompetitionMatch[]> {
  const { data } = await apiClient.get<CompetitionMatch[]>(
    `/competitions/${competitionId}/matches`,
  );
  return data;
}

export async function createMatch(
  competitionId: string,
  match: NewCompetitionMatch,
): Promise<CompetitionMatch> {
  const { data } = await apiClient.post<CompetitionMatch>(
    `/competitions/${competitionId}/matches`,
    match,
  );
  return data;
}

export async function updateMatch(
  competitionId: string,
  matchId: string,
  changes: Partial<NewCompetitionMatch>,
): Promise<CompetitionMatch> {
  const { data } = await apiClient.patch<CompetitionMatch>(
    `/competitions/${competitionId}/matches/${matchId}`,
    changes,
  );
  return data;
}

export async function deleteMatch(
  competitionId: string,
  matchId: string,
): Promise<void> {
  await apiClient.delete(`/competitions/${competitionId}/matches/${matchId}`);
}
