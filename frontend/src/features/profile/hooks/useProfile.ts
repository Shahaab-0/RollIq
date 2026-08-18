import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../../../api/profile';
import { showToast } from '../../../lib/toast';
import { getApiErrorMessage } from '../../../lib/apiError';
import type { Profile } from '../types';

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: getProfile });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: Partial<Omit<Profile, 'id'>>) => updateProfile(changes),
    onSuccess: updated => {
      queryClient.setQueryData(['profile'], updated);
    },
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not save your profile'), 'error'),
    meta: { toastSuccess: 'Profile saved' },
  });
}
