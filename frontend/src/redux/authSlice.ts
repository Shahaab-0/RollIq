import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as authApi from '../api/auth';
import { clearTokens, getStoredTokens, saveTokens } from '../api/tokenStorage';
import type { AuthCredentials, AuthStatus, Session } from '../features/auth/types';

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

async function persistSession(session: Session): Promise<void> {
  await saveTokens({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
  });
}

// Restores any persisted session on launch by validating the stored tokens
// against the server (rather than trusting them blindly) -- there's no
// push-based auth listener, so this is the only place a session gets restored.
export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const tokens = await getStoredTokens();
  if (!tokens) return null;

  try {
    const user = await authApi.me();
    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    } satisfies Session;
  } catch {
    await clearTokens();
    return null;
  }
});

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password }: AuthCredentials) => {
    const session = await authApi.signUp(email, password);
    await persistSession(session);
    return session;
  },
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: AuthCredentials) => {
    const session = await authApi.signIn(email, password);
    await persistSession(session);
    return session;
  },
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_: void, { getState }) => {
    const { auth } = getState() as { auth: AuthState };
    if (auth.session) {
      await authApi.signOut(auth.session.refreshToken).catch(() => undefined);
    }
    await clearTokens();
  },
);

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
      .addCase(signUp.fulfilled, (state, action) => {
        state.authenticating = false;
        state.session = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.authenticating = false;
        state.error = action.error.message ?? 'Sign up failed';
      })
      .addCase(signIn.pending, state => {
        state.authenticating = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.authenticating = false;
        state.session = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.authenticating = false;
        state.error = action.error.message ?? 'Sign in failed';
      })
      .addCase(signOut.fulfilled, state => {
        state.session = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = action.error.message ?? 'Sign out failed';
      });
  },
});

export const { sessionChanged } = authSlice.actions;
export default authSlice.reducer;
