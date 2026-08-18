import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from '../../../redux/hooks';
import { signIn, signOut, signUp } from '../../../redux/authSlice';
import { showToast } from '../../../lib/toast';
import { getApiErrorMessage } from '../../../lib/apiError';
import type { AuthCredentials } from '../types';

// Thin useMutation wrappers around the authSlice thunks, which still own the
// actual API call + token persistence + session state update -- this just
// gives screens the same mutateAsync/isPending shape as every other feature.
export function useSignIn() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => dispatch(signIn(credentials)).unwrap(),
    onSuccess: () => showToast('Signed in', 'success'),
    onError: error => showToast(getApiErrorMessage(error, 'Sign in failed'), 'error'),
  });
}

export function useSignUp() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => dispatch(signUp(credentials)).unwrap(),
    onSuccess: () => showToast('Account created', 'success'),
    onError: error => showToast(getApiErrorMessage(error, 'Sign up failed'), 'error'),
  });
}

export function useSignOut() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: () => dispatch(signOut()).unwrap(),
    onSuccess: () => showToast('Signed out', 'success'),
    onError: error => showToast(getApiErrorMessage(error, 'Could not sign out'), 'error'),
  });
}
