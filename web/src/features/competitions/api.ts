import { apiClient } from '@/lib/apiClient';
import type { Competition, CompetitionMatch, NewCompetition, NewCompetitionMatch } from './types';

export async function listCompetitions(): Promise<Competition[]> {
  return apiClient.get<Competition[]>('/competitions');
}

export async function createCompetition(competition: NewCompetition): Promise<Competition> {
  return apiClient.post<Competition>('/competitions', competition);
}

export async function updateCompetition(id: string, changes: Partial<NewCompetition>): Promise<Competition> {
  return apiClient.patch<Competition>(`/competitions/${id}`, changes);
}

export async function deleteCompetition(id: string): Promise<void> {
  await apiClient.delete(`/competitions/${id}`);
}

export async function listMatches(competitionId: string): Promise<CompetitionMatch[]> {
  return apiClient.get<CompetitionMatch[]>(`/competitions/${competitionId}/matches`);
}

export async function createMatch(competitionId: string, match: NewCompetitionMatch): Promise<CompetitionMatch> {
  return apiClient.post<CompetitionMatch>(`/competitions/${competitionId}/matches`, match);
}

export async function updateMatch(
  competitionId: string,
  matchId: string,
  changes: Partial<NewCompetitionMatch>,
): Promise<CompetitionMatch> {
  return apiClient.patch<CompetitionMatch>(`/competitions/${competitionId}/matches/${matchId}`, changes);
}

export async function deleteMatch(competitionId: string, matchId: string): Promise<void> {
  await apiClient.delete(`/competitions/${competitionId}/matches/${matchId}`);
}
