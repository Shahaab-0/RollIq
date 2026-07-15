import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import type { Profile } from '../features/profile/types';

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

const PROFILE_COLUMNS = 'id, display_name, current_belt, current_stripes, home_gym';

export const fetchProfile = createAsyncThunk('profile/fetch', async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as Profile;

  // No row yet — happens for accounts created before the auto-create
  // trigger existed (or any other edge case). Create it now instead of
  // leaving the app permanently stuck with no profile to edit/save.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: userId })
    .select(PROFILE_COLUMNS)
    .single();
  if (insertError) throw insertError;
  return created as Profile;
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
      .select(PROFILE_COLUMNS)
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
