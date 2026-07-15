import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import type { RootState } from './store';
import { updateProfile } from './profileSlice';
import type {
  Belt,
  BeltPromotion,
  NewBeltPromotion,
} from '../features/profile/types';

const BELT_PROMOTION_COLUMNS = 'id, belt, stripes, promoted_on, notes';

interface BeltPromotionsState {
  items: BeltPromotion[];
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: BeltPromotionsState = {
  items: [],
  status: 'idle',
  error: null,
};

function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export const fetchBeltPromotions = createAsyncThunk(
  'beltPromotions/fetch',
  async () => {
    const { data, error } = await supabase
      .from('belt_promotions')
      .select(BELT_PROMOTION_COLUMNS)
      .order('promoted_on', { ascending: true });
    if (error) throw error;
    return data as BeltPromotion[];
  },
);

// Dedicated "log a past/new belt promotion" flow (Profile's Belt History
// "+" form) — always resets stripes to 0, since that's what a real belt
// promotion does, and keeps profiles.current_belt in sync.
export const createBeltPromotion = createAsyncThunk(
  'beltPromotions/create',
  async (promotion: NewBeltPromotion, { getState, dispatch }) => {
    const userId = (getState() as RootState).auth.session?.user.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('belt_promotions')
      .insert({ ...promotion, stripes: 0, user_id: userId })
      .select(BELT_PROMOTION_COLUMNS)
      .single();
    if (error) throw error;

    await dispatch(
      updateProfile({ current_belt: promotion.belt, current_stripes: 0 }),
    );

    return data as BeltPromotion;
  },
);

// Auto-log from the main Profile "Save Changes" flow whenever belt or
// stripes actually increased — this is what feeds the Dashboard timeline
// for day-to-day progress, not just explicit backfilled promotions.
export const logProgressMilestone = createAsyncThunk(
  'beltPromotions/logMilestone',
  async (
    {
      belt,
      stripes,
      promotedOn,
    }: { belt: Belt; stripes: number; promotedOn?: string },
    { getState },
  ) => {
    const userId = (getState() as RootState).auth.session?.user.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('belt_promotions')
      .insert({
        belt,
        stripes,
        promoted_on: promotedOn ?? toLocalDateString(new Date()),
        user_id: userId,
      })
      .select(BELT_PROMOTION_COLUMNS)
      .single();
    if (error) throw error;
    return data as BeltPromotion;
  },
);

export const deleteBeltPromotion = createAsyncThunk(
  'beltPromotions/delete',
  async (id: string) => {
    const { error } = await supabase
      .from('belt_promotions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  },
);

const beltPromotionsSlice = createSlice({
  name: 'beltPromotions',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBeltPromotions.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchBeltPromotions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
      })
      .addCase(fetchBeltPromotions.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.error.message ?? 'Failed to load belt history';
      })
      .addCase(createBeltPromotion.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to log promotion';
      })
      .addCase(logProgressMilestone.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to log progress';
      })
      .addCase(deleteBeltPromotion.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(deleteBeltPromotion.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to delete promotion';
      })
      .addMatcher(
        (
          a,
        ): a is
          | ReturnType<typeof createBeltPromotion.fulfilled>
          | ReturnType<typeof logProgressMilestone.fulfilled> =>
          a.type === createBeltPromotion.fulfilled.type ||
          a.type === logProgressMilestone.fulfilled.type,
        (state, action) => {
          state.items.push(action.payload);
          state.items.sort((a, b) => a.promoted_on.localeCompare(b.promoted_on));
        },
      );
  },
});

export default beltPromotionsSlice.reducer;
