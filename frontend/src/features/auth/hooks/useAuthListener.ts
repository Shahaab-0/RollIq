import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { restoreSession } from '../../../redux/authSlice';
import { registerForPushNotifications } from '../../../lib/pushNotifications';

// Restores any persisted session on launch. There's no push-based session
// listener -- sign-in/up/out already update Redux via their own thunks'
// fulfilled reducers, and the axios response interceptor dispatches
// sessionChanged(null) directly on an unrecoverable 401 -- so a mount-only
// restore is all this needs.
export function useAuthListener() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.auth.session?.user.id);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Registers this device's push token whenever a session becomes active --
  // covers both a fresh sign-in and a restored session on relaunch.
  useEffect(() => {
    if (userId) {
      registerForPushNotifications();
    }
  }, [userId]);
}
