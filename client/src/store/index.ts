// store/index.ts - VIURL Redux Store Configuration
// Location: client/src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import feedReducer from './slices/feedSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'feed/createPost/pending',
          'feed/createPostWithMedia/pending',
        ],
        // Ignore these field paths in state
        ignoredPaths: ['feed.posts'],
      },
    }),
  devTools: import.meta.env?.DEV ?? process.env.NODE_ENV === 'development',
});

// Infer types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;