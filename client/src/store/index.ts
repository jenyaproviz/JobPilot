import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './jobsSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;