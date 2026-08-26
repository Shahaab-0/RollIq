'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as injuriesApi from '../api';
import { showToast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/apiClient';
import type { NewInjury } from '../types';

export function useInjuries() {
  return useQuery({ queryKey: ['injuries'], queryFn: injuriesApi.listInjuries });
}

export function useCreateInjury() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (injury: NewInjury) => injuriesApi.createInjury(injury),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['injuries'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not save this injury'), 'error'),
    meta: { toastSuccess: 'Injury logged' },
  });
}

export function useUpdateInjury() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<NewInjury> }) => injuriesApi.updateInjury(id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['injuries'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not save this injury'), 'error'),
    meta: { toastSuccess: 'Injury updated' },
  });
}

export function useDeleteInjury() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => injuriesApi.deleteInjury(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['injuries'] }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not delete this injury'), 'error'),
    meta: { toastSuccess: 'Injury deleted' },
  });
}
