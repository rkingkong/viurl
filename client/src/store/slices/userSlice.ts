import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserState, User } from '../../types';

const API_BASE = '/api';

const initialState: UserState = {
  currentUser: null,
  profileUser: null,
  loading: false,
  error: null,
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch user');
      return data.user || data;
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
      if (!response.ok) return rejectWithValue(data.message || 'Failed to follow');
      return { userId, followed: true };
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'user/unfollowUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/follow`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to unfollow');
      return { userId, followed: false };
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
    },
    setProfileUser: (state, action: PayloadAction<User>) => {
      state.profileUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.profileUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileUser, setProfileUser } = userSlice.actions;
export default userSlice.reducer;
