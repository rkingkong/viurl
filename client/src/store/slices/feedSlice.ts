import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { FeedState, Post } from '../../types';

const API_BASE = 'https://viurl.com';

const initialState: FeedState = {
  posts: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 1
};

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (page: number = 1) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/posts?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch feed');
    return response.json();
  }
);

export const createPost = createAsyncThunk(
  'feed/createPost',
  async (content: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    clearFeed: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts || [];
        state.hasMore = action.payload.hasMore || false;
        state.page = action.payload.page || 1;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load feed';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        if (action.payload.post) {
          state.posts.unshift(action.payload.post);
        }
      });
  }
});

export const { addPost, clearFeed } = feedSlice.actions;
export default feedSlice.reducer;
