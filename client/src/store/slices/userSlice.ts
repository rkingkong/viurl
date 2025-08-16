import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserState, User } from '../../types';

const initialState: UserState = {
  currentUser: null,
  darkMode: false,
  profile: null,
  loading: false,
  error: null
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (username: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updates: Partial<User>) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/users/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load profile';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      });
  }
});

export const { toggleDarkMode, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
