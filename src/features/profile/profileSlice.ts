import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import type { Profile } from './types';

interface ProfileState {
  data: Profile | null;
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchProfile = createAsyncThunk('profile/fetch', async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, current_belt, current_stripes, home_gym')
    .single();
  if (error) throw error;
  return data as Profile;
});

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (changes: Partial<Omit<Profile, 'id'>>, { getState }) => {
    const state = getState() as { profile: ProfileState };
    const id = state.profile.data?.id;
    if (!id) throw new Error('No profile loaded to update');

    const { data, error } = await supabase
      .from('profiles')
      .update(changes)
      .eq('id', id)
      .select('id, display_name, current_belt, current_stripes, home_gym')
      .single();
    if (error) throw error;
    return data as Profile;
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'ready';
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.error.message ?? 'Failed to load profile';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to update profile';
      });
  },
});

export default profileSlice.reducer;
