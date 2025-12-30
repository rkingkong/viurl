import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FeedState, Post } from '../../types';

const API_BASE = '/api';

const initialState: FeedState = {
  posts: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  refreshing: false,
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/posts?page=${page}&limit=20`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch');
      return {
        posts: data.posts || data.data || data,
        page,
        hasMore: data.hasMore ?? (data.posts?.length === 20),
      };
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const refreshFeed = createAsyncThunk(
  'feed/refreshFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/posts?page=1&limit=20`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to refresh');
      return {
        posts: data.posts || data.data || data,
        hasMore: data.hasMore ?? (data.posts?.length === 20),
      };
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const createPost = createAsyncThunk(
  'feed/createPost',
  async ({ content }: { content: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to create');
      return data.post || data;
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const likePost = createAsyncThunk(
  'feed/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to like');
      return { postId, liked: data.liked ?? true };
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const repostPost = createAsyncThunk(
  'feed/repostPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/repost`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to repost');
      return { postId, reposted: data.reposted ?? true };
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const bookmarkPost = createAsyncThunk(
  'feed/bookmarkPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to bookmark');
      return { postId, bookmarked: data.bookmarked ?? true };
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const verifyPost = createAsyncThunk(
  'feed/verifyPost',
  async (
    { postId, verdict, confidence, evidence, reasoning }: {
      postId: string;
      verdict: string;
      confidence: number;
      evidence: object[];
      reasoning: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE}/verification/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ postId, verdict, confidence, evidence, reasoning }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to verify');
      return { postId, tokensEarned: data.tokensEarned };
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const deletePost = createAsyncThunk(
  'feed/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) return rejectWithValue('Failed to delete');
      return postId;
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'feed/fetchUserPosts',
  async ({ userId, page = 1 }: { userId: string; page?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/posts?page=${page}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch');
      return {
        posts: data.posts || data.data || data,
        page,
        hasMore: data.hasMore ?? (data.posts?.length === 20),
      };
    } catch {
      return rejectWithValue('Network error');
    }
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
    prependPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.posts = action.payload.posts;
        } else {
          const ids = new Set(state.posts.map((p) => p._id));
          const newPosts = action.payload.posts.filter((p: Post) => !ids.has(p._id));
          state.posts = [...state.posts, ...newPosts];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshFeed.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(refreshFeed.fulfilled, (state, action) => {
        state.refreshing = false;
        state.posts = action.payload.posts;
        state.page = 1;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(refreshFeed.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload as string;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) post.isLikedByMe = action.payload.liked;
      })
      .addCase(repostPost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.isRepostedByMe = action.payload.reposted;
          post.reposts = (post.reposts || 0) + (action.payload.reposted ? 1 : -1);
        }
      })
      .addCase(bookmarkPost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.isBookmarkedByMe = action.payload.bookmarked;
          post.bookmarks = (post.bookmarks || 0) + (action.payload.bookmarked ? 1 : -1);
        }
      })
      .addCase(verifyPost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) post.isVerifiedByMe = true;
      })
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.posts = action.payload.posts;
        } else {
          const ids = new Set(state.posts.map((p) => p._id));
          const newPosts = action.payload.posts.filter((p: Post) => !ids.has(p._id));
          state.posts = [...state.posts, ...newPosts];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFeed, prependPost } = feedSlice.actions;
export default feedSlice.reducer;
