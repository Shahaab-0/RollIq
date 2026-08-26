'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as authApi from '../api';
import { showToast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/apiClient';

export function useMe() {
  return useQuery({ queryKey: ['auth', 'me'], queryFn: authApi.getMe });
}

export function useSignIn() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signIn(email, password),
    onSuccess: () => {
      showToast('Signed in', 'success');
      router.push('/dashboard');
      router.refresh();
    },
    onError: error => showToast(getApiErrorMessage(error, 'Sign in failed'), 'error'),
  });
}

export function useSignUp() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signUp(email, password),
    onSuccess: () => {
      showToast('Account created', 'success');
      router.push('/dashboard');
      router.refresh();
    },
    onError: error => showToast(getApiErrorMessage(error, 'Sign up failed'), 'error'),
  });
}

export function useSignOut() {
  const router = useRouter();
  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      showToast('Signed out', 'success');
      router.push('/signin');
      router.refresh();
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not sign out'), 'error'),
  });
}

// Deliberately does not reuse useSignOut's mutationFn -- the account (and
// its refresh tokens) is already gone server-side by the time signOut()
// runs, so this only needs the cookie-clearing side effect, not a real
// backend /auth/signout round trip (authApi.signOut() is best-effort and
// always clears cookies regardless of that call's outcome, same contract).
export function useDeleteAccount() {
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      await authApi.deleteAccount();
      await authApi.signOut();
    },
    onSuccess: () => {
      showToast('Account deleted', 'success');
      router.push('/signin');
      router.refresh();
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not delete account'), 'error'),
  });
}
