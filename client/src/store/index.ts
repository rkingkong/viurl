// store/index.ts - VIURL Redux Store Configuration
// Location: client/src/store/index.ts

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import feedReducer from './slices/feedSlice';

// ============================================
// Root Reducer
// ============================================

const rootReducer = combineReducers({
  auth: authReducer,
  feed: feedReducer,
});

// ============================================
// Store Configuration
// ============================================

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (for file uploads, etc.)
        ignoredActions: ['feed/createPostWithMedia/pending'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.media', 'meta.arg.media'],
        // Ignore these paths in the state
        ignoredPaths: ['feed.currentPost.media'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// ============================================
// Type Exports
// ============================================

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ============================================
// Store Subscription (Optional - for debugging)
// ============================================

if (process.env.NODE_ENV === 'development') {
  store.subscribe(() => {
    const state = store.getState();
    console.log('📦 Redux State Updated:', {
      auth: {
        isAuthenticated: state.auth.isAuthenticated,
        user: state.auth.user?.username,
        vtokens: state.auth.user?.vtokens,
      },
      feed: {
        postsCount: state.feed.posts.length,
        loading: state.feed.loading,
        feedType: state.feed.feedType,
      },
    });
  });
}

// ============================================
// Export Store
// ============================================

export default store;