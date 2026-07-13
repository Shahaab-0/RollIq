import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import profileReducer from '../features/profile/profileSlice';
import sessionsReducer from '../features/trainingLog/sessionsSlice';
import techniquesReducer from '../features/techniques/techniquesSlice';
import rollsReducer from '../features/rolls/rollsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    sessions: sessionsReducer,
    techniques: techniquesReducer,
    rolls: rollsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
