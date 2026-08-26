'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as profileApi from '../api';
import { showToast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/apiClient';
import type { Profile } from '../types';

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: profileApi.getProfile });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: Partial<Omit<Profile, 'id'>>) => profileApi.updateProfile(changes),
    onSuccess: updated => {
      queryClient.setQueryData(['profile'], updated);
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not save your profile'), 'error'),
    meta: { toastSuccess: 'Profile saved' },
  });
}
