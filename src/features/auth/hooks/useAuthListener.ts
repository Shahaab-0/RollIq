import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAppDispatch } from '../../../app/hooks';
import { restoreSession, sessionChanged } from '../authSlice';

// Restores any persisted session on launch, then keeps Redux in sync with
// Supabase's own auth state (sign in/out, token refresh) for the app's lifetime.
export function useAuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(sessionChanged(session));
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [dispatch]);
}
