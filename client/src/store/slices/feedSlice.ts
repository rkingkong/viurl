// feedSlice.ts - VIURL Feed State Management
// Location: client/src/store/slices/feedSlice.ts
// VERSION: Fixed with all necessary exports including addPost

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Post, FeedState, FeedType, AuthState } from '../../types';

const API_BASE = '/api';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('viurl_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const initialState: FeedState = {
  posts: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
  cursor: undefined,
  feedType: 'forYou',
  refreshing: false,
};

// Async Thunks
export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/posts?page=${page}&limit=20`, {
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch feed');
      }
      
      return {
        posts: data.posts || data.data || data,
        page,
        hasMore: (data.posts || data.data || data).length === 20,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
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
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to refresh feed');
      }
      
      return {
        posts: data.posts || data.data || data,
        hasMore: (data.posts || data.data || data).length === 20,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
    }
  }
);

export const createPost = createAsyncThunk(
  'feed/createPost',
  async (content: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create post');
      }
      
      return data.post || data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
    }
  }
);

export const verifyPost = createAsyncThunk(
  'feed/verifyPost',
  async ({ postId, verdict, sources, explanation }: {
    postId: string;
    verdict: 'true' | 'false' | 'misleading' | 'partially_true';
    sources?: string[];
    explanation?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ verdict, sources, explanation }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to verify post');
      }
      
      return {
        postId,
        ...data,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
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
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to like post');
      }
      
      return { postId, ...data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
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
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to repost');
      }
      
      return { postId, ...data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
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
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to bookmark');
      }
      
      return { postId, ...data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
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
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Failed to delete post');
      }
      
      return postId;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
    }
  }
);

// Slice
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    prependPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    appendPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts.push(...action.payload);
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    removePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(p => p._id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFeedType: (state, action: PayloadAction<FeedType>) => {
      state.feedType = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetFeed: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
    // Local optimistic updates
    addLocalVerification: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const post = state.posts.find(p => p._id === action.payload.postId);
      if (post) {
        post.verificationCount = (post.verificationCount || 0) + 1;
        post.isVerifiedByMe = true;
        if (!post.verifiedBy) post.verifiedBy = [];
        post.verifiedBy.push(action.payload.userId);
      }
    },
    addLocalRepost: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const post = state.posts.find(p => p._id === action.payload.postId);
      if (post) {
        post.repostCount = (post.repostCount || 0) + 1;
        post.isRepostedByMe = true;
        if (!post.repostedBy) post.repostedBy = [];
        post.repostedBy.push(action.payload.userId);
      }
    },
    addLocalBookmark: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const post = state.posts.find(p => p._id === action.payload.postId);
      if (post) {
        post.bookmarkCount = (post.bookmarkCount || 0) + 1;
        post.isBookmarkedByMe = true;
        if (!post.bookmarkedBy) post.bookmarkedBy = [];
        post.bookmarkedBy.push(action.payload.userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Feed
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.posts = action.payload.posts;
        } else {
          state.posts.push(...action.payload.posts);
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh Feed
      .addCase(refreshFeed.pending, (state) => {
        state.refreshing = true;
        state.error = null;
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
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify Post
      .addCase(verifyPost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.verificationCount = (post.verificationCount || 0) + 1;
          post.isVerifiedByMe = true;
          if (action.payload.newStatus) {
            post.factCheckStatus = action.payload.newStatus;
          }
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload);
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.isLikedByMe = !post.isLikedByMe;
        }
      })
      // Repost
      .addCase(repostPost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.repostCount = (post.repostCount || 0) + 1;
          post.isRepostedByMe = true;
        }
      })
      // Bookmark
      .addCase(bookmarkPost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.bookmarkCount = (post.bookmarkCount || 0) + 1;
          post.isBookmarkedByMe = !post.isBookmarkedByMe;
        }
      });
  },
});

// Export ALL actions
export const {
  setPosts,
  addPost,
  prependPost,
  appendPosts,
  updatePost,
  removePost,
  setLoading,
  setError,
  setFeedType,
  setRefreshing,
  setHasMore,
  setPage,
  resetFeed,
  addLocalVerification,
  addLocalRepost,
  addLocalBookmark,
} = feedSlice.actions;

// Export reducer
export default feedSlice.reducer;