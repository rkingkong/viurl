// authSlice.ts - VIURL Authentication State Management
// Location: client/src/store/slices/authSlice.ts
// VERSION: Fixed with all necessary exports

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState, LoginCredentials, RegisterCredentials } from '../../types';

const API_BASE = '/api';

// Get stored auth data
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('viurl_token');
  } catch {
    return null;
  }
};

const getStoredUser = (): User | null => {
  try {
    const user = localStorage.getItem('viurl_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
};

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }
      
      // Store in localStorage
      if (data.token) {
        localStorage.setItem('viurl_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('viurl_user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }
      
      // Store in localStorage
      if (data.token) {
        localStorage.setItem('viurl_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('viurl_user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('No token available');
      }
      
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch user');
      }
      
      // Update stored user
      localStorage.setItem('viurl_user', JSON.stringify(data.user || data));
      
      return data.user || data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
    }
  }
);

export const claimDailyBonus = createAsyncThunk(
  'auth/claimDailyBonus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      
      const response = await fetch(`${API_BASE}/tokens/daily-bonus`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to claim bonus');
      }
      
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network error';
      return rejectWithValue(message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('viurl_user', JSON.stringify(action.payload));
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem('viurl_token', action.payload);
      } else {
        localStorage.removeItem('viurl_token');
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('viurl_token');
      localStorage.removeItem('viurl_user');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTokenBalance: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.vtokens = action.payload;
        localStorage.setItem('viurl_user', JSON.stringify(state.user));
      }
    },
    updateTrustScore: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.trustScore = action.payload;
        localStorage.setItem('viurl_user', JSON.stringify(state.user));
      }
    },
    addVerifiedPost: (state, action: PayloadAction<string>) => {
      if (state.user) {
        if (!state.user.verifiedPosts) {
          state.user.verifiedPosts = [];
        }
        if (!state.user.verifiedPosts.includes(action.payload)) {
          state.user.verifiedPosts.push(action.payload);
        }
        localStorage.setItem('viurl_user', JSON.stringify(state.user));
      }
    },
    updateBadge: (state, action: PayloadAction<User['verificationBadge']>) => {
      if (state.user) {
        state.user.verificationBadge = action.payload;
        localStorage.setItem('viurl_user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
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
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Claim Daily Bonus
      .addCase(claimDailyBonus.fulfilled, (state, action) => {
        if (state.user && action.payload.newBalance !== undefined) {
          state.user.vtokens = action.payload.newBalance;
          localStorage.setItem('viurl_user', JSON.stringify(state.user));
        }
      });
  },
});

// Export actions
export const {
  setLoading,
  setUser,
  setToken,
  logout,
  clearError,
  updateTokenBalance,
  updateTrustScore,
  addVerifiedPost,
  updateBadge,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;