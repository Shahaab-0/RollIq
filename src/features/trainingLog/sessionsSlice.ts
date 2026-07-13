import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { RootState } from '../../app/store';
import type { NewSession, Session } from './types';

const SESSION_COLUMNS =
  'id, date, gi, duration_minutes, session_type, instructor, notes, rounds_count, round_minutes, productivity_rating, submissions_landed_count';

interface SessionsState {
  items: Session[];
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: SessionsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchSessions = createAsyncThunk('sessions/fetch', async () => {
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_COLUMNS)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Session[];
});

export const createSession = createAsyncThunk(
  'sessions/create',
  async (session: NewSession, { getState }) => {
    const userId = (getState() as RootState).auth.session?.user.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sessions')
      .insert({ ...session, user_id: userId })
      .select(SESSION_COLUMNS)
      .single();
    if (error) throw error;
    return data as Session;
  },
);

export const updateSession = createAsyncThunk(
  'sessions/update',
  async ({ id, changes }: { id: string; changes: Partial<NewSession> }) => {
    const { data, error } = await supabase
      .from('sessions')
      .update(changes)
      .eq('id', id)
      .select(SESSION_COLUMNS)
      .single();
    if (error) throw error;
    return data as Session;
  },
);

export const deleteSession = createAsyncThunk(
  'sessions/delete',
  async (id: string) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) throw error;
    return id;
  },
);

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSessions.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.error.message ?? 'Failed to load sessions';
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.items.sort((a, b) => (a.date < b.date ? 1 : -1));
      })
      .addCase(createSession.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to create session';
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        const idx = state.items.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to update session';
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.items = state.items.filter(s => s.id !== action.payload);
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to delete session';
      });
  },
});

export default sessionsSlice.reducer;
