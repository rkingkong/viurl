// userSlice.ts - VIURL User Profile State Management
// Location: client/src/store/slices/userSlice.ts
// FIXED: Matches UserState type definition

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserState, User } from '../../types';

const API_BASE = '/api';

const initialState: UserState = {
  profile: null,
  darkMode: false,
  currentUser: null,
  profileUser: null,
  loading: false,
  error: null,
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch user');
      }
      
      return data.user || data.data || data;
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (
    profileData: {
      name?: string;
      bio?: string;
      location?: string;
      website?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update profile');
      }
      
      return data.user || data.data || data;
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const followUser = createAsyncThunk(
  'user/followUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/follow`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to follow user');
      }
      
      return { userId, following: true };
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'user/unfollowUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/unfollow`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to unfollow user');
      }
      
      return { userId, following: false };
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearProfileUser: (state) => {
      state.profileUser = null;
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    setProfileUser: (state, action: PayloadAction<User | null>) => {
      state.profileUser = action.payload;
    },
    updateCurrentUserStats: (
      state,
      action: PayloadAction<{ trustScore?: number; vtokens?: number }>
    ) => {
      if (state.currentUser) {
        if (action.payload.trustScore !== undefined) {
          state.currentUser.trustScore = action.payload.trustScore;
        }
        if (action.payload.vtokens !== undefined) {
          state.currentUser.vtokens = action.payload.vtokens;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileUser = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        // Also update profileUser if it's the same user
        if (state.profileUser && state.currentUser && 
            (state.profileUser._id === state.currentUser._id || 
             state.profileUser.id === state.currentUser.id)) {
          state.profileUser = action.payload;
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Follow User
      .addCase(followUser.fulfilled, (state, action) => {
        if (state.profileUser && 
            (state.profileUser._id === action.payload.userId || 
             state.profileUser.id === action.payload.userId)) {
          state.profileUser.isFollowing = true;
          state.profileUser.followers = (typeof state.profileUser.followers === 'number' ? state.profileUser.followers : (state.profileUser.followers?.length || 0)) + 1;
        }
      })
      // Unfollow User
      .addCase(unfollowUser.fulfilled, (state, action) => {
        if (state.profileUser && 
            (state.profileUser._id === action.payload.userId || 
             state.profileUser.id === action.payload.userId)) {
          state.profileUser.isFollowing = false;
          state.profileUser.followers = Math.max(0, (typeof state.profileUser.followers === 'number' ? state.profileUser.followers : (state.profileUser.followers?.length || 0)) - 1);
        }
      });
  },
});

export const {
  clearProfileUser,
  setCurrentUser,
  setProfileUser,
  updateCurrentUserStats,
} = userSlice.actions;

export default userSlice.reducer;