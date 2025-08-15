import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import web3Reducer from './slices/web3Slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    web3: web3Reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;