import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { RootState } from '../../app/store';
import type { NewTechnique, Technique } from './types';

const TECHNIQUE_COLUMNS = 'id, name, position, notes, resource_url, drill_count';

interface TechniquesState {
  items: Technique[];
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: TechniquesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchTechniques = createAsyncThunk('techniques/fetch', async () => {
  const { data, error } = await supabase
    .from('techniques')
    .select(TECHNIQUE_COLUMNS)
    .order('name', { ascending: true });
  if (error) throw error;
  return data as Technique[];
});

export const createTechnique = createAsyncThunk(
  'techniques/create',
  async (technique: NewTechnique, { getState }) => {
    const userId = (getState() as RootState).auth.session?.user.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('techniques')
      .insert({ ...technique, user_id: userId })
      .select(TECHNIQUE_COLUMNS)
      .single();
    if (error) throw error;
    return data as Technique;
  },
);

export const updateTechnique = createAsyncThunk(
  'techniques/update',
  async ({ id, changes }: { id: string; changes: Partial<NewTechnique> }) => {
    const { data, error } = await supabase
      .from('techniques')
      .update(changes)
      .eq('id', id)
      .select(TECHNIQUE_COLUMNS)
      .single();
    if (error) throw error;
    return data as Technique;
  },
);

export const incrementDrillCount = createAsyncThunk(
  'techniques/incrementDrillCount',
  async (id: string, { getState }) => {
    const current = (getState() as RootState).techniques.items.find(
      t => t.id === id,
    );
    if (!current) throw new Error('Technique not found');

    const { data, error } = await supabase
      .from('techniques')
      .update({ drill_count: current.drill_count + 1 })
      .eq('id', id)
      .select(TECHNIQUE_COLUMNS)
      .single();
    if (error) throw error;
    return data as Technique;
  },
);

export const deleteTechnique = createAsyncThunk(
  'techniques/delete',
  async (id: string) => {
    const { error } = await supabase.from('techniques').delete().eq('id', id);
    if (error) throw error;
    return id;
  },
);

const techniquesSlice = createSlice({
  name: 'techniques',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTechniques.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchTechniques.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
      })
      .addCase(fetchTechniques.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.error.message ?? 'Failed to load techniques';
      })
      .addCase(createTechnique.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createTechnique.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to create technique';
      })
      .addCase(updateTechnique.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to update technique';
      })
      .addCase(incrementDrillCount.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to log drill';
      })
      .addCase(deleteTechnique.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTechnique.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to delete technique';
      })
      .addMatcher(
        (a): a is ReturnType<typeof updateTechnique.fulfilled> | ReturnType<typeof incrementDrillCount.fulfilled> =>
          a.type === updateTechnique.fulfilled.type ||
          a.type === incrementDrillCount.fulfilled.type,
        (state, action) => {
          const idx = state.items.findIndex(t => t.id === action.payload.id);
          if (idx !== -1) state.items[idx] = action.payload;
        },
      );
  },
});

export default techniquesSlice.reducer;
