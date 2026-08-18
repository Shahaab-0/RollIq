import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as sessionsApi from '../../../api/sessions';
import { showToast } from '../../../lib/toast';
import { getApiErrorMessage } from '../../../lib/apiError';
import type { NewSession } from '../types';

export function useSessions() {
  return useQuery({ queryKey: ['sessions'], queryFn: sessionsApi.listSessions });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (session: NewSession) => sessionsApi.createSession(session),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not save this session'), 'error'),
    meta: { toastSuccess: 'Session logged' },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<NewSession> }) =>
      sessionsApi.updateSession(id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not save this session'), 'error'),
    meta: { toastSuccess: 'Session updated' },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionsApi.deleteSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not delete this session'), 'error'),
    meta: { toastSuccess: 'Session deleted' },
  });
}
