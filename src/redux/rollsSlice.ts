import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import type { RootState } from './store';
import type { NewRoll, Roll } from '../features/rolls/types';

const ROLL_COLUMNS =
  'id, session_id, partner_name, submissions_landed, submissions_received, escapes, effort_rating, notes, created_at';

interface RollsState {
  items: Roll[];
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: RollsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchRolls = createAsyncThunk('rolls/fetch', async () => {
  const { data, error } = await supabase
    .from('rolls')
    .select(ROLL_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Roll[];
});

export const createRoll = createAsyncThunk(
  'rolls/create',
  async (roll: NewRoll, { getState }) => {
    const userId = (getState() as RootState).auth.session?.user.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('rolls')
      .insert({ ...roll, user_id: userId })
      .select(ROLL_COLUMNS)
      .single();
    if (error) throw error;
    return data as Roll;
  },
);

export const updateRoll = createAsyncThunk(
  'rolls/update',
  async ({ id, changes }: { id: string; changes: Partial<NewRoll> }) => {
    const { data, error } = await supabase
      .from('rolls')
      .update(changes)
      .eq('id', id)
      .select(ROLL_COLUMNS)
      .single();
    if (error) throw error;
    return data as Roll;
  },
);

export const deleteRoll = createAsyncThunk('rolls/delete', async (id: string) => {
  const { error } = await supabase.from('rolls').delete().eq('id', id);
  if (error) throw error;
  return id;
});

const rollsSlice = createSlice({
  name: 'rolls',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchRolls.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchRolls.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
      })
      .addCase(fetchRolls.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.error.message ?? 'Failed to load rolls';
      })
      .addCase(createRoll.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createRoll.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to create roll';
      })
      .addCase(updateRoll.fulfilled, (state, action) => {
        const idx = state.items.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateRoll.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to update roll';
      })
      .addCase(deleteRoll.fulfilled, (state, action) => {
        state.items = state.items.filter(r => r.id !== action.payload);
      })
      .addCase(deleteRoll.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to delete roll';
      });
  },
});

export default rollsSlice.reducer;
