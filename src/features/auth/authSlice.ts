import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { AuthCredentials, AuthStatus } from './types';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  authenticating: boolean;
  error: string | null;
}

const initialState: AuthState = {
  status: 'idle',
  session: null,
  authenticating: false,
  error: null,
};

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
});

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password }: AuthCredentials) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: AuthCredentials) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionChanged(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
      state.status = 'ready';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(restoreSession.pending, state => {
        state.status = 'loading';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.session = action.payload;
        state.status = 'ready';
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.error.message ?? 'Failed to restore session';
      })
      .addCase(signUp.pending, state => {
        state.authenticating = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, state => {
        state.authenticating = false;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.authenticating = false;
        state.error = action.error.message ?? 'Sign up failed';
      })
      .addCase(signIn.pending, state => {
        state.authenticating = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, state => {
        state.authenticating = false;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.authenticating = false;
        state.error = action.error.message ?? 'Sign in failed';
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = action.error.message ?? 'Sign out failed';
      });
  },
});

export const { sessionChanged } = authSlice.actions;
export default authSlice.reducer;
