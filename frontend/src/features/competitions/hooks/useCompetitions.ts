import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as competitionsApi from '../../../api/competitions';
import { showToast } from '../../../lib/toast';
import { getApiErrorMessage } from '../../../lib/apiError';
import type { NewCompetition, NewCompetitionMatch } from '../types';

export function useCompetitions() {
  return useQuery({ queryKey: ['competitions'], queryFn: competitionsApi.listCompetitions });
}

export function useCreateCompetition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (competition: NewCompetition) => competitionsApi.createCompetition(competition),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competitions'] }),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not save this competition'), 'error'),
    meta: { toastSuccess: 'Competition logged' },
  });
}

export function useUpdateCompetition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<NewCompetition> }) =>
      competitionsApi.updateCompetition(id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competitions'] }),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not save this competition'), 'error'),
    meta: { toastSuccess: 'Competition updated' },
  });
}

export function useDeleteCompetition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => competitionsApi.deleteCompetition(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competitions'] }),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not delete this competition'), 'error'),
    meta: { toastSuccess: 'Competition deleted' },
  });
}

export function useCompetitionMatches(competitionId: string | undefined) {
  return useQuery({
    queryKey: ['competitions', competitionId, 'matches'],
    queryFn: () => competitionsApi.listMatches(competitionId as string),
    enabled: !!competitionId,
  });
}

export function useCreateMatch(competitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (match: NewCompetitionMatch) =>
      competitionsApi.createMatch(competitionId, match),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', competitionId, 'matches'] });
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not save this match'), 'error'),
    meta: { toastSuccess: 'Match logged' },
  });
}

export function useUpdateMatch(competitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      matchId,
      changes,
    }: {
      matchId: string;
      changes: Partial<NewCompetitionMatch>;
    }) => competitionsApi.updateMatch(competitionId, matchId, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', competitionId, 'matches'] });
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not save this match'), 'error'),
    meta: { toastSuccess: 'Match updated' },
  });
}

export function useDeleteMatch(competitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => competitionsApi.deleteMatch(competitionId, matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', competitionId, 'matches'] });
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not delete this match'), 'error'),
    meta: { toastSuccess: 'Match deleted' },
  });
}
