import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from '../../../redux/hooks';
import {
  signIn,
  signOut,
  signUp,
  sessionChanged,
} from '../../../redux/authSlice';
import * as authApi from '../../../api/auth';
import { clearTokens } from '../../../api/tokenStorage';
import { showToast } from '../../../lib/toast';
import { getApiErrorMessage } from '../../../lib/apiError';
import { unregisterForPushNotifications } from '../../../lib/pushNotifications';
import type { AuthCredentials } from '../types';

// Thin useMutation wrappers around the authSlice thunks, which still own the
// actual API call + token persistence + session state update -- this just
// gives screens the same mutateAsync/isPending shape as every other feature.
export function useSignIn() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (credentials: AuthCredentials) =>
      dispatch(signIn(credentials)).unwrap(),
    onSuccess: () => showToast('Signed in', 'success'),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Sign in failed'), 'error'),
  });
}

export function useSignUp() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (credentials: AuthCredentials) =>
      dispatch(signUp(credentials)).unwrap(),
    onSuccess: () => showToast('Account created', 'success'),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Sign up failed'), 'error'),
  });
}

export function useSignOut() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: async () => {
      await unregisterForPushNotifications();
      return dispatch(signOut()).unwrap();
    },
    onSuccess: () => showToast('Signed out', 'success'),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not sign out'), 'error'),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onError: error =>
      showToast(
        getApiErrorMessage(error, 'Could not send a reset code'),
        'error',
      ),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      email,
      code,
      newPassword,
    }: {
      email: string;
      code: string;
      newPassword: string;
    }) => authApi.resetPassword(email, code, newPassword),
    onSuccess: () =>
      showToast('Password reset — sign in with your new password', 'success'),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not reset password'), 'error'),
  });
}

// Deliberately doesn't call the real /auth/signout endpoint first -- the
// account (and its refresh tokens) are already gone server-side once the
// delete call succeeds, so this just tears down local state the same way
// the axios interceptor does on an unrecoverable 401.
export function useDeleteAccount() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: async () => {
      await authApi.deleteAccount();
      await unregisterForPushNotifications();
      await clearTokens();
      dispatch(sessionChanged(null));
    },
    onSuccess: () => showToast('Account deleted', 'success'),
    onError: error =>
      showToast(getApiErrorMessage(error, 'Could not delete account'), 'error'),
  });
}
