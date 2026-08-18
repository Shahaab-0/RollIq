import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as rollsApi from '../../../api/rolls';
import { showToast } from '../../../lib/toast';
import { getApiErrorMessage } from '../../../lib/apiError';
import type { NewRoll } from '../types';

export function useRolls() {
  return useQuery({ queryKey: ['rolls'], queryFn: rollsApi.listRolls });
}

export function useCreateRoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roll: NewRoll) => rollsApi.createRoll(roll),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rolls'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not save this roll'), 'error'),
    meta: { toastSuccess: 'Roll logged' },
  });
}

export function useUpdateRoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<NewRoll> }) =>
      rollsApi.updateRoll(id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rolls'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not save this roll'), 'error'),
    meta: { toastSuccess: 'Roll updated' },
  });
}

export function useDeleteRoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rollsApi.deleteRoll(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rolls'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not delete this roll'), 'error'),
    meta: { toastSuccess: 'Roll deleted' },
  });
}
