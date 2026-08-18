import { useEffect } from 'react';
import { useAppDispatch } from '../../../redux/hooks';
import { restoreSession } from '../../../redux/authSlice';

// Restores any persisted session on launch. There's no push-based session
// listener -- sign-in/up/out already update Redux via their own thunks'
// fulfilled reducers, and the axios response interceptor dispatches
// sessionChanged(null) directly on an unrecoverable 401 -- so a mount-only
// restore is all this needs.
export function useAuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
}
