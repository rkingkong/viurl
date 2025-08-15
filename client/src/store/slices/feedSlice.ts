import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: number;
  verifications: number;
  isVerified: boolean;
  hasLiked: boolean;
  hasRetweeted: boolean;
  hasVerified: boolean;
}

interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

const initialState: FeedState = {
  posts: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
};

// Fetch posts
export const fetchPosts = createAsyncThunk(
  'feed/fetchPosts',
  async (page: number = 1) => {
    const response = await axios.get(`/api/posts?page=${page}`);
    return response.data;
  }
);

// Create post
export const createPost = createAsyncThunk(
  'feed/createPost',
  async (content: string) => {
    const response = await axios.post('/api/posts', { content });
    return response.data;
  }
);

// Like post
export const likePost = createAsyncThunk(
  'feed/likePost',
  async (postId: string) => {
    const response = await axios.post(`/api/posts/${postId}/like`);
    return { postId, ...response.data };
  }
);

// Verify post
export const verifyPost = createAsyncThunk(
  'feed/verifyPost',
  async (postId: string) => {
    const response = await axios.post(`/api/posts/${postId}/verify`);
    return { postId, ...response.data };
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearFeed: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [...state.posts, ...action.payload.posts];
        }
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts = [action.payload, ...state.posts];
      })
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.postId);
        if (post) {
          post.hasLiked = !post.hasLiked;
          post.likes = action.payload.likes;
        }
      })
      // Verify post
      .addCase(verifyPost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.postId);
        if (post) {
          post.hasVerified = !post.hasVerified;
          post.verifications = action.payload.verifications;
        }
      });
  },
});

export const { clearFeed } = feedSlice.actions;
export default feedSlice.reducer;
