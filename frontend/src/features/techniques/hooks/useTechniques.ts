import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as techniquesApi from '../../../api/techniques';
import { showToast } from '../../../lib/toast';
import { getApiErrorMessage } from '../../../lib/apiError';
import type { NewTechnique } from '../types';

export function useTechniques() {
  return useQuery({
    queryKey: ['techniques'],
    queryFn: techniquesApi.listTechniques,
  });
}

export function useCreateTechnique() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (technique: NewTechnique) =>
      techniquesApi.createTechnique(technique),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['techniques'] }),
    onError: error =>
      showToast(
        getApiErrorMessage(error, 'Could not save this technique'),
        'error',
      ),
    meta: { toastSuccess: 'Technique added' },
  });
}

export function useUpdateTechnique() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<NewTechnique>;
    }) => techniquesApi.updateTechnique(id, changes),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['techniques'] }),
    onError: error =>
      showToast(
        getApiErrorMessage(error, 'Could not save this technique'),
        'error',
      ),
    meta: { toastSuccess: 'Technique updated' },
  });
}

export function useIncrementDrillCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => techniquesApi.incrementDrillCount(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['techniques'] }),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not log that drill'), 'error'),
    // No success toast -- the drill count updating on screen is feedback enough.
  });
}

export function useDeleteTechnique() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => techniquesApi.deleteTechnique(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['techniques'] }),
    onError: error =>
      showToast(
        getApiErrorMessage(error, 'Could not delete this technique'),
        'error',
      ),
    meta: { toastSuccess: 'Technique deleted' },
  });
}

export function useImportFundamentals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      seeds: {
        name: string;
        position: string;
        notes: string;
        resource_url: string | null;
      }[],
    ) => techniquesApi.importFundamentals(seeds),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['techniques'] }),
    onError: error =>
      showToast(
        getApiErrorMessage(error, 'Could not import fundamentals'),
        'error',
      ),
    meta: { toastSuccess: 'Fundamentals imported' },
  });
}
