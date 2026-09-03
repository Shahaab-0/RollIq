import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as beltPromotionsApi from '../../../api/beltPromotions';
import { showToast } from '../../../lib/toast';
import { getApiErrorMessage } from '../../../lib/apiError';
import type { Belt } from '../types';

export function useBeltPromotions() {
  return useQuery({
    queryKey: ['beltPromotions'],
    queryFn: beltPromotionsApi.listBeltPromotions,
  });
}

// Dedicated "log a past/new belt promotion" flow -- the backend resets
// stripes to 0 and syncs profiles.current_belt/current_stripes in one
// transaction, so invalidating both queries here is all the client needs to do.
export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (promotion: {
      belt: Belt;
      promoted_on: string;
      notes?: string | null;
    }) => beltPromotionsApi.createPromotion(promotion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beltPromotions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: error =>
      showToast(
        getApiErrorMessage(error, 'Could not log this promotion'),
        'error',
      ),
    meta: { toastSuccess: 'Promotion logged' },
  });
}

// Auto-log from the main Profile "Save Changes" flow -- does not touch the
// profile itself, since the caller already calls useUpdateProfile directly.
// ProfileScreen already shows its own contextual Alert for both outcomes
// here (the exact stripe/belt earned), so this deliberately has no onError
// -- a generic toast on top of that Alert would report the same failure twice.
export function useLogMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (milestone: {
      belt: Belt;
      stripes: number;
      promoted_on?: string;
    }) => beltPromotionsApi.logMilestone(milestone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beltPromotions'] });
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => beltPromotionsApi.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beltPromotions'] });
    },
    onError: error =>
      showToast(
        getApiErrorMessage(error, 'Could not delete this promotion'),
        'error',
      ),
    meta: { toastSuccess: 'Promotion deleted' },
  });
}
