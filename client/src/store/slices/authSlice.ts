// authSlice.ts - Redux auth slice with backend API integration
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface User {
  _id: string;
  email: string;
  name: string;
  username: string;
  profilePicture?: string;
  trustScore: number;
  vtokens: number;
  isVerified: boolean;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  followers: number;
  following: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  username: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

// Get token from localStorage on initialization
const storedToken = localStorage.getItem('viurl_token');
const storedUser = localStorage.getItem('viurl_user');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      const { token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('viurl_token', token);
      localStorage.setItem('viurl_user', JSON.stringify(user));
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

// Async thunk for register
export const register = createAsyncThunk<AuthResponse, RegisterCredentials>(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, credentials);
      const { token, user } = response.data;
      
      // For registration, we don't automatically log in
      // Just return the data
      return { token, user };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // Clear localStorage
    localStorage.removeItem('viurl_token');
    localStorage.removeItem('viurl_user');
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
    
    // Optional: Call backend logout endpoint if you have one
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
      // Ignore logout errors - we're logging out locally anyway
    }
  }
);

// Async thunk for fetching current user
export const fetchCurrentUser = createAsyncThunk<User>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      
      if (!token) {
        throw new Error('No token available');
      }
      
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const user = response.data.user;
      
      // Update stored user
      localStorage.setItem('viurl_user', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch user';
      return rejectWithValue(message);
    }
  }
);

// Async thunk for updating user profile
export const updateProfile = createAsyncThunk<User, Partial<User>>(
  'auth/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      
      if (!token) {
        throw new Error('No token available');
      }
      
      const response = await axios.put(
        `${API_BASE_URL}/users/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const user = response.data.user;
      
      // Update stored user
      localStorage.setItem('viurl_user', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload}`;
    },
    updateUserLocally: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('viurl_user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      });
    
    // Register cases
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Don't automatically log in after registration
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Logout cases
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout fails on backend, clear local state
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      });
    
    // Fetch current user cases
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Update profile cases
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setToken, updateUserLocally } = authSlice.actions;
export default authSlice.reducer;