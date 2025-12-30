// authSlice.ts - VIURL Authentication State Management
// Location: client/src/store/slices/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

// API Base URL
const API_BASE = 'https://viurl.com';

// ============================================
// State Interface
// ============================================

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  registrationSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
  registrationSuccess: false,
};

// ============================================
// Async Thunks
// ============================================

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (
    userData: { email: string; password: string; username: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Get Current User
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return rejectWithValue(data.message || 'Failed to get user');
      }

      // Update cached user
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Update Profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    profileData: {
      name?: string;
      bio?: string;
      location?: string;
      website?: string;
      profilePicture?: string;
      bannerImage?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update profile');
      }

      // Update cached user
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Update V-TKN Balance (after verification, etc.)
export const updateTokenBalance = createAsyncThunk(
  'auth/updateTokenBalance',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/api/users/tokens`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to get token balance');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// ============================================
// Slice
// ============================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set user directly (for initialization)
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear registration success flag
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    // Update user's V-TKN balance locally
    addTokens: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.vtokens = (state.user.vtokens || 0) + action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    // Update trust score locally
    updateTrustScore: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.trustScore = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    // Add a verified post to user's list
    addVerifiedPost: (state, action: PayloadAction<string>) => {
      if (state.user) {
        if (!state.user.verifiedPosts) {
          state.user.verifiedPosts = [];
        }
        if (!state.user.verifiedPosts.includes(action.payload)) {
          state.user.verifiedPosts.push(action.payload);
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },

    // Update follower count
    updateFollowers: (state, action: PayloadAction<{ increment: boolean }>) => {
      if (state.user) {
        state.user.followers = (state.user.followers || 0) + (action.payload.increment ? 1 : -1);
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    // Update following count
    updateFollowing: (state, action: PayloadAction<{ increment: boolean }>) => {
      if (state.user) {
        state.user.following = (state.user.following || 0) + (action.payload.increment ? 1 : -1);
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },

  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.registrationSuccess = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.registrationSuccess = false;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Token Balance
    builder
      .addCase(updateTokenBalance.fulfilled, (state, action) => {
        if (state.user) {
          state.user.vtokens = action.payload.vtokens;
          state.user.trustScore = action.payload.trustScore;
        }
      });
  },
});

// Export actions
export const {
  setUser,
  setLoading,
  clearError,
  clearRegistrationSuccess,
  logout,
  addTokens,
  updateTrustScore,
  addVerifiedPost,
  updateFollowers,
  updateFollowing,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// ============================================
// Selectors
// ============================================

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectUserTokens = (state: { auth: AuthState }) => state.auth.user?.vtokens || 0;
export const selectUserTrustScore = (state: { auth: AuthState }) => state.auth.user?.trustScore || 0;
export const selectUserBadge = (state: { auth: AuthState }) => state.auth.user?.verificationBadge || 'none';