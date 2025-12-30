// feedSlice.ts - VIURL Feed & Posts State Management
// Location: client/src/store/slices/feedSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Post } from '../../types';

// API Base URL
const API_BASE = 'https://viurl.com';

// ============================================
// State Interface
// ============================================

interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  
  // Current post being viewed
  currentPost: Post | null;
  currentPostLoading: boolean;
  
  // Create post state
  createPostLoading: boolean;
  createPostError: string | null;
  
  // Verification state
  verifyingPostId: string | null;
  
  // Trending topics
  trending: { topic: string; postCount: number; isVerified: boolean }[];
  
  // Feed filter
  feedType: 'for-you' | 'following';
}

const initialState: FeedState = {
  posts: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  
  currentPost: null,
  currentPostLoading: false,
  
  createPostLoading: false,
  createPostError: null,
  
  verifyingPostId: null,
  
  trending: [],
  
  feedType: 'for-you',
};

// ============================================
// Helper: Get Auth Header
// ============================================

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ============================================
// Async Thunks
// ============================================

// Fetch Feed
export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (page: number = 1, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { feed: FeedState };
      const feedType = state.feed.feedType;
      
      const response = await fetch(
        `${API_BASE}/api/posts?page=${page}&limit=20&type=${feedType}`,
        {
          headers: {
            ...getAuthHeader(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch feed');
      }

      return {
        posts: data.posts || [],
        page,
        hasMore: data.hasMore ?? (data.posts?.length === 20),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Fetch Single Post
export const fetchPost = createAsyncThunk(
  'feed/fetchPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch post');
      }

      return data.post || data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Create Post
export const createPost = createAsyncThunk(
  'feed/createPost',
  async (content: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create post');
      }

      return data.post || data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Create Post with Media
export const createPostWithMedia = createAsyncThunk(
  'feed/createPostWithMedia',
  async (
    { content, media }: { content: string; media: File[] },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      media.forEach((file, index) => {
        formData.append(`media`, file);
      });

      const response = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create post');
      }

      return data.post || data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Delete Post
export const deletePost = createAsyncThunk(
  'feed/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete post');
      }

      return postId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Verify Post (THE VIURL SPECIAL!)
export const verifyPost = createAsyncThunk(
  'feed/verifyPost',
  async (
    { postId, isTrue, sources, explanation }: {
      postId: string;
      isTrue?: boolean;
      sources?: string[];
      explanation?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ isTrue, sources, explanation }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to verify post');
      }

      return {
        postId,
        verification: data.verification,
        post: data.post,
        tokensEarned: data.tokensEarned || 0,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Repost
export const repostPost = createAsyncThunk(
  'feed/repostPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/repost`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to repost');
      }

      return { postId, reposted: data.reposted };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Bookmark Post
export const bookmarkPost = createAsyncThunk(
  'feed/bookmarkPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to bookmark');
      }

      return { postId, bookmarked: data.bookmarked };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Fetch User Posts
export const fetchUserPosts = createAsyncThunk(
  'feed/fetchUserPosts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}/posts`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch user posts');
      }

      return data.posts || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Fetch Trending Topics
export const fetchTrending = createAsyncThunk(
  'feed/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/posts/trending`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch trending');
      }

      return data.trending || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Search Posts
export const searchPosts = createAsyncThunk(
  'feed/searchPosts',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/posts/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            ...getAuthHeader(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Search failed');
      }

      return data.posts || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// ============================================
// Slice
// ============================================

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    // Clear feed (for refresh)
    clearFeed: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },

    // Set feed type (for-you / following)
    setFeedType: (state, action: PayloadAction<'for-you' | 'following'>) => {
      state.feedType = action.payload;
    },

    // Clear current post
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.currentPostLoading = false;
    },

    // Clear create post error
    clearCreatePostError: (state) => {
      state.createPostError = null;
    },

    // Optimistic update for verification
    optimisticVerify: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const post = state.posts.find(p => p._id === action.payload.postId);
      if (post) {
        if (!post.verifications) {
          post.verifications = [];
        }
        post.verifications.push(action.payload.userId as any);
        post.verificationCount = (post.verificationCount || 0) + 1;
      }
    },

    // Optimistic update for repost
    optimisticRepost: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const post = state.posts.find(p => p._id === action.payload.postId);
      if (post) {
        if (!post.repostedBy) {
          post.repostedBy = [];
        }
        const alreadyReposted = post.repostedBy.some(
          (id: any) => id.toString() === action.payload.userId || id === action.payload.userId
        );
        if (!alreadyReposted) {
          post.repostedBy.push(action.payload.userId as any);
          post.reposts = (post.reposts || 0) + 1;
        }
      }
    },

    // Optimistic update for bookmark
    optimisticBookmark: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const post = state.posts.find(p => p._id === action.payload.postId);
      if (post) {
        if (!post.bookmarkedBy) {
          post.bookmarkedBy = [];
        }
        const alreadyBookmarked = post.bookmarkedBy.some(
          (id: any) => id.toString() === action.payload.userId || id === action.payload.userId
        );
        if (alreadyBookmarked) {
          post.bookmarkedBy = post.bookmarkedBy.filter(
            (id: any) => id.toString() !== action.payload.userId && id !== action.payload.userId
          );
        } else {
          post.bookmarkedBy.push(action.payload.userId as any);
        }
      }
    },

    // Add new post to top of feed
    addPostToFeed: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },

    // Remove post from feed
    removePostFromFeed: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(p => p._id !== action.payload);
    },

    // Update a specific post in feed
    updatePostInFeed: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
  },

  extraReducers: (builder) => {
    // Fetch Feed
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
          // Append new posts (avoid duplicates)
          const existingIds = new Set(state.posts.map(p => p._id));
          const newPosts = action.payload.posts.filter((p: Post) => !existingIds.has(p._id));
          state.posts = [...state.posts, ...newPosts];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
        state.error = null;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Single Post
    builder
      .addCase(fetchPost.pending, (state) => {
        state.currentPostLoading = true;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.currentPostLoading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPost.rejected, (state) => {
        state.currentPostLoading = false;
        state.currentPost = null;
      });

    // Create Post
    builder
      .addCase(createPost.pending, (state) => {
        state.createPostLoading = true;
        state.createPostError = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createPostLoading = false;
        state.posts.unshift(action.payload); // Add to top of feed
        state.createPostError = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createPostLoading = false;
        state.createPostError = action.payload as string;
      });

    // Create Post with Media
    builder
      .addCase(createPostWithMedia.pending, (state) => {
        state.createPostLoading = true;
        state.createPostError = null;
      })
      .addCase(createPostWithMedia.fulfilled, (state, action) => {
        state.createPostLoading = false;
        state.posts.unshift(action.payload);
        state.createPostError = null;
      })
      .addCase(createPostWithMedia.rejected, (state, action) => {
        state.createPostLoading = false;
        state.createPostError = action.payload as string;
      });

    // Delete Post
    builder
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload);
      });

    // Verify Post
    builder
      .addCase(verifyPost.pending, (state, action) => {
        state.verifyingPostId = action.meta.arg.postId;
      })
      .addCase(verifyPost.fulfilled, (state, action) => {
        state.verifyingPostId = null;
        // Update the post with new verification data
        const index = state.posts.findIndex(p => p._id === action.payload.postId);
        if (index !== -1 && action.payload.post) {
          state.posts[index] = action.payload.post;
        }
      })
      .addCase(verifyPost.rejected, (state) => {
        state.verifyingPostId = null;
      });

    // Repost
    builder
      .addCase(repostPost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.reposts = (post.reposts || 0) + (action.payload.reposted ? 1 : -1);
        }
      });

    // Bookmark
    builder
      .addCase(bookmarkPost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.bookmarks = (post.bookmarks || 0) + (action.payload.bookmarked ? 1 : -1);
        }
      });

    // Fetch User Posts
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Trending
    builder
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.trending = action.payload;
      });

    // Search Posts
    builder
      .addCase(searchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
        state.hasMore = false;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearFeed,
  setFeedType,
  clearCurrentPost,
  clearCreatePostError,
  optimisticVerify,
  optimisticRepost,
  optimisticBookmark,
  addPostToFeed,
  removePostFromFeed,
  updatePostInFeed,
} = feedSlice.actions;

// Export reducer
export default feedSlice.reducer;

// ============================================
// Selectors
// ============================================

export const selectPosts = (state: { feed: FeedState }) => state.feed.posts;
export const selectFeedLoading = (state: { feed: FeedState }) => state.feed.loading;
export const selectFeedError = (state: { feed: FeedState }) => state.feed.error;
export const selectHasMore = (state: { feed: FeedState }) => state.feed.hasMore;
export const selectCurrentPage = (state: { feed: FeedState }) => state.feed.page;
export const selectCurrentPost = (state: { feed: FeedState }) => state.feed.currentPost;
export const selectFeedType = (state: { feed: FeedState }) => state.feed.feedType;
export const selectTrending = (state: { feed: FeedState }) => state.feed.trending;
export const selectIsVerifying = (state: { feed: FeedState }) => state.feed.verifyingPostId;
export const selectCreatePostLoading = (state: { feed: FeedState }) => state.feed.createPostLoading;