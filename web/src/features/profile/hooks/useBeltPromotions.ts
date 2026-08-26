'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as profileApi from '../api';
import { showToast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/apiClient';
import type { Belt } from '../types';

export function useBeltPromotions() {
  return useQuery({ queryKey: ['beltPromotions'], queryFn: profileApi.listBeltPromotions });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (promotion: { belt: Belt; promoted_on: string; notes?: string | null }) =>
      profileApi.createPromotion(promotion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beltPromotions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not log this promotion'), 'error'),
    meta: { toastSuccess: 'Promotion logged' },
  });
}

// Auto-log from the main Profile "Save Changes" flow -- ProfilePage already
// shows its own contextual alert for the outcome, so this deliberately has
// no onError (a generic toast on top would report the same failure twice).
export function useLogMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (milestone: { belt: Belt; stripes: number; promoted_on?: string }) =>
      profileApi.logMilestone(milestone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beltPromotions'] });
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profileApi.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beltPromotions'] });
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not delete this promotion'), 'error'),
    meta: { toastSuccess: 'Promotion deleted' },
  });
}
