import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import sessionsReducer from './sessionsSlice';
import techniquesReducer from './techniquesSlice';
import rollsReducer from './rollsSlice';
import beltPromotionsReducer from './beltPromotionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    sessions: sessionsReducer,
    techniques: techniquesReducer,
    rolls: rollsReducer,
    beltPromotions: beltPromotionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
