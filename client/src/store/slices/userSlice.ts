import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  banner: string;
  reputation: number;
  tokens: {
    VTOKENS: number;
    likes: number;
    dislikes: number;
    shares: number;
  };
  following: number;
  followers: number;
  postsCount: number;
  joinedDate: string;
  isFollowing: boolean;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  followers: any[];
  following: any[];
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  followers: [],
  following: [],
};

// Fetch user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (username: string) => {
    const response = await axios.get(`/api/users/${username}`);
    return response.data;
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: { bio?: string; avatar?: string; banner?: string }) => {
    const response = await axios.put('/api/users/profile', data);
    return response.data;
  }
);

// Follow/Unfollow user
export const toggleFollow = createAsyncThunk(
  'user/toggleFollow',
  async (userId: string) => {
    const response = await axios.post(`/api/users/${userId}/follow`);
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.followers = [];
      state.following = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
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
        state.error = action.error.message || 'Failed to fetch profile';
      })
      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      // Toggle follow
      .addCase(toggleFollow.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.isFollowing = action.payload.isFollowing;
          state.profile.followers = action.payload.followersCount;
        }
      });
  },
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;
