// useApi.ts - VIURL Centralized API Hooks
// Location: client/src/hooks/useApi.ts

import { useState, useCallback } from 'react';
import {
  User,
  Post,
  Verification,
  Notification,
  Conversation,
  Message,
  CreatePostData,
  VerificationSubmission,
  LoginCredentials,
  RegisterData,
  EditProfileData,
  TokenTransaction,
  ApiResponse,
  PaginatedResponse,
  SearchResult,
  TrendingTopic,
  LeaderboardEntry,
  SendMessageData,
} from '../types';

// ============================================
// API CONFIGURATION
// ============================================

const API_BASE = 'https://viurl.com/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Base fetch wrapper with auth
const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Request failed',
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

// File upload wrapper
const apiUpload = async <T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Upload failed',
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload error',
    };
  }
};

// ============================================
// GENERIC API HOOK
// ============================================

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApiRequest = <T>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    request: () => Promise<ApiResponse<T>>
  ): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });

    const response = await request();

    if (response.success && response.data) {
      setState({ data: response.data, loading: false, error: null });
      return response.data;
    } else {
      setState({ data: null, loading: false, error: response.error || 'Error' });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
};

// ============================================
// AUTH HOOKS
// ============================================

export const useAuth = () => {
  const login = async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiFetch<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  };

  const register = async (data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiFetch<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const getMe = async (): Promise<ApiResponse<User>> => {
    return apiFetch<User>('/auth/me');
  };

  const refreshToken = async (): Promise<ApiResponse<{ token: string }>> => {
    return apiFetch<{ token: string }>('/auth/refresh', { method: 'POST' });
  };

  const requestPasswordReset = async (email: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  return {
    login,
    register,
    logout,
    getMe,
    refreshToken,
    requestPasswordReset,
    resetPassword,
    changePassword,
  };
};

// ============================================
// POSTS HOOKS
// ============================================

export const usePosts = () => {
  const getFeed = async (
    type: 'forYou' | 'following' | 'verified' = 'forYou',
    cursor?: string,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const params = new URLSearchParams({ type, limit: limit.toString() });
    if (cursor) params.append('cursor', cursor);
    return apiFetch<PaginatedResponse<Post>>(`/posts/feed?${params}`);
  };

  const getPost = async (postId: string): Promise<ApiResponse<Post>> => {
    return apiFetch<Post>(`/posts/${postId}`);
  };

  const createPost = async (data: CreatePostData): Promise<ApiResponse<Post>> => {
    // Handle media uploads if present
    if (data.media && data.media.length > 0) {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('visibility', data.visibility);
      if (data.replyTo) formData.append('replyTo', data.replyTo);
      if (data.quotedPost) formData.append('quotedPost', data.quotedPost);
      if (data.poll) formData.append('poll', JSON.stringify(data.poll));
      data.media.forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });
      return apiUpload<Post>('/posts', formData);
    }

    return apiFetch<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const deletePost = async (postId: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/posts/${postId}`, { method: 'DELETE' });
  };

  const repost = async (postId: string): Promise<ApiResponse<Post>> => {
    return apiFetch<Post>(`/posts/${postId}/repost`, { method: 'POST' });
  };

  const unrepost = async (postId: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/posts/${postId}/repost`, { method: 'DELETE' });
  };

  const bookmark = async (postId: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/posts/${postId}/bookmark`, { method: 'POST' });
  };

  const unbookmark = async (postId: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/posts/${postId}/bookmark`, { method: 'DELETE' });
  };

  const getComments = async (
    postId: string,
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<PaginatedResponse<Post>>(`/posts/${postId}/comments${params}`);
  };

  const getUserPosts = async (
    username: string,
    type: 'posts' | 'replies' | 'media' | 'likes' = 'posts',
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const params = new URLSearchParams({ type });
    if (cursor) params.append('cursor', cursor);
    return apiFetch<PaginatedResponse<Post>>(`/users/${username}/posts?${params}`);
  };

  const getBookmarks = async (cursor?: string): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<PaginatedResponse<Post>>(`/posts/bookmarks${params}`);
  };

  const votePoll = async (postId: string, optionId: string): Promise<ApiResponse<Post>> => {
    return apiFetch<Post>(`/posts/${postId}/poll/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    });
  };

  return {
    getFeed,
    getPost,
    createPost,
    deletePost,
    repost,
    unrepost,
    bookmark,
    unbookmark,
    getComments,
    getUserPosts,
    getBookmarks,
    votePoll,
  };
};

// ============================================
// VERIFICATION HOOKS
// ============================================

export const useVerification = () => {
  const verifyPost = async (data: VerificationSubmission): Promise<ApiResponse<Verification>> => {
    return apiFetch<Verification>('/verifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const getPostVerifications = async (
    postId: string,
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<Verification>>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<PaginatedResponse<Verification>>(`/posts/${postId}/verifications${params}`);
  };

  const getMyVerifications = async (
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<Verification>>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<PaginatedResponse<Verification>>(`/verifications/me${params}`);
  };

  const getUserVerifications = async (
    username: string,
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<Verification>>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<PaginatedResponse<Verification>>(`/users/${username}/verifications${params}`);
  };

  const getVerificationStats = async (): Promise<ApiResponse<{
    totalVerifications: number;
    accuracyRate: number;
    tokensEarned: number;
    rank: number;
  }>> => {
    return apiFetch('/verifications/stats');
  };

  const upvoteVerification = async (verificationId: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/verifications/${verificationId}/upvote`, { method: 'POST' });
  };

  const downvoteVerification = async (verificationId: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/verifications/${verificationId}/downvote`, { method: 'POST' });
  };

  const getVerifiedContent = async (
    status: 'true' | 'false' | 'misleading' | 'partially_true',
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const params = new URLSearchParams({ status });
    if (cursor) params.append('cursor', cursor);
    return apiFetch<PaginatedResponse<Post>>(`/verifications/content?${params}`);
  };

  return {
    verifyPost,
    getPostVerifications,
    getMyVerifications,
    getUserVerifications,
    getVerificationStats,
    upvoteVerification,
    downvoteVerification,
    getVerifiedContent,
  };
};

// ============================================
// USER HOOKS
// ============================================

export const useUsers = () => {
  const getUser = async (username: string): Promise<ApiResponse<User>> => {
    return apiFetch<User>(`/users/${username}`);
  };

  const updateProfile = async (data: EditProfileData): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.bio) formData.append('bio', data.bio);
    if (data.location) formData.append('location', data.location);
    if (data.website) formData.append('website', data.website);
    if (data.profilePicture) formData.append('profilePicture', data.profilePicture);
    if (data.bannerImage) formData.append('bannerImage', data.bannerImage);
    return apiUpload<User>('/users/profile', formData);
  };

  const follow = async (username: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/users/${username}/follow`, { method: 'POST' });
  };

  const unfollow = async (username: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/users/${username}/follow`, { method: 'DELETE' });
  };

  const getFollowers = async (
    username: string,
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<PaginatedResponse<User>>(`/users/${username}/followers${params}`);
  };

  const getFollowing = async (
    username: string,
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<PaginatedResponse<User>>(`/users/${username}/following${params}`);
  };

  const block = async (username: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/users/${username}/block`, { method: 'POST' });
  };

  const unblock = async (username: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/users/${username}/block`, { method: 'DELETE' });
  };

  const mute = async (username: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/users/${username}/mute`, { method: 'POST' });
  };

  const unmute = async (username: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/users/${username}/mute`, { method: 'DELETE' });
  };

  const getSuggestedUsers = async (limit: number = 5): Promise<ApiResponse<User[]>> => {
    return apiFetch<User[]>(`/users/suggested?limit=${limit}`);
  };

  return {
    getUser,
    updateProfile,
    follow,
    unfollow,
    getFollowers,
    getFollowing,
    block,
    unblock,
    mute,
    unmute,
    getSuggestedUsers,
  };
};

// ============================================
// NOTIFICATION HOOKS
// ============================================

export const useNotifications = () => {
  const getNotifications = async (
    cursor?: string,
    filter?: 'all' | 'verifications' | 'mentions'
  ): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (filter) params.append('filter', filter);
    return apiFetch<PaginatedResponse<Notification>>(`/notifications?${params}`);
  };

  const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
    return apiFetch<{ count: number }>('/notifications/unread-count');
  };

  const markAsRead = async (notificationId: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/notifications/${notificationId}/read`, { method: 'POST' });
  };

  const markAllAsRead = async (): Promise<ApiResponse<void>> => {
    return apiFetch<void>('/notifications/read-all', { method: 'POST' });
  };

  const deleteNotification = async (notificationId: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/notifications/${notificationId}`, { method: 'DELETE' });
  };

  const updateSettings = async (settings: any): Promise<ApiResponse<void>> => {
    return apiFetch<void>('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  };

  return {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
  };
};

// ============================================
// MESSAGES HOOKS
// ============================================

export const useMessages = () => {
  const getConversations = async (
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<Conversation>>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<PaginatedResponse<Conversation>>(`/messages/conversations${params}`);
  };

  const getConversation = async (conversationId: string): Promise<ApiResponse<Conversation>> => {
    return apiFetch<Conversation>(`/messages/conversations/${conversationId}`);
  };

  const getMessages = async (
    conversationId: string,
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<Message>>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<PaginatedResponse<Message>>(
      `/messages/conversations/${conversationId}/messages${params}`
    );
  };

  const sendMessage = async (data: SendMessageData): Promise<ApiResponse<Message>> => {
    if (data.media) {
      const formData = new FormData();
      if (data.conversationId) formData.append('conversationId', data.conversationId);
      if (data.recipientId) formData.append('recipientId', data.recipientId);
      formData.append('content', data.content);
      formData.append('type', data.type);
      formData.append('media', data.media);
      return apiUpload<Message>('/messages', formData);
    }

    return apiFetch<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const markConversationAsRead = async (conversationId: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/messages/conversations/${conversationId}/read`, { method: 'POST' });
  };

  const deleteConversation = async (conversationId: string): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/messages/conversations/${conversationId}`, { method: 'DELETE' });
  };

  const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
    return apiFetch<{ count: number }>('/messages/unread-count');
  };

  const startConversation = async (recipientId: string): Promise<ApiResponse<Conversation>> => {
    return apiFetch<Conversation>('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  };

  return {
    getConversations,
    getConversation,
    getMessages,
    sendMessage,
    markConversationAsRead,
    deleteConversation,
    getUnreadCount,
    startConversation,
  };
};

// ============================================
// SEARCH HOOKS
// ============================================

export const useSearch = () => {
  const search = async (
    query: string,
    type: 'all' | 'posts' | 'users' | 'hashtags' = 'all',
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<SearchResult>>> => {
    const params = new URLSearchParams({ q: query, type });
    if (cursor) params.append('cursor', cursor);
    return apiFetch<PaginatedResponse<SearchResult>>(`/search?${params}`);
  };

  const getTrending = async (): Promise<ApiResponse<TrendingTopic[]>> => {
    return apiFetch<TrendingTopic[]>('/search/trending');
  };

  const getHashtag = async (
    tag: string,
    cursor?: string
  ): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<PaginatedResponse<Post>>(`/search/hashtag/${tag}${params}`);
  };

  const getRecentSearches = async (): Promise<ApiResponse<string[]>> => {
    return apiFetch<string[]>('/search/recent');
  };

  const clearRecentSearches = async (): Promise<ApiResponse<void>> => {
    return apiFetch<void>('/search/recent', { method: 'DELETE' });
  };

  return {
    search,
    getTrending,
    getHashtag,
    getRecentSearches,
    clearRecentSearches,
  };
};

// ============================================
// TOKEN HOOKS
// ============================================

export const useTokens = () => {
  const getBalance = async (): Promise<ApiResponse<{
    balance: number;
    pendingBalance: number;
    totalEarned: number;
  }>> => {
    return apiFetch('/tokens/balance');
  };

  const getTransactions = async (
    cursor?: string,
    type?: string
  ): Promise<ApiResponse<PaginatedResponse<TokenTransaction>>> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (type) params.append('type', type);
    return apiFetch<PaginatedResponse<TokenTransaction>>(`/tokens/transactions?${params}`);
  };

  const transfer = async (
    recipientUsername: string,
    amount: number,
    note?: string
  ): Promise<ApiResponse<TokenTransaction>> => {
    return apiFetch<TokenTransaction>('/tokens/transfer', {
      method: 'POST',
      body: JSON.stringify({ recipientUsername, amount, note }),
    });
  };

  const claimDailyBonus = async (): Promise<ApiResponse<{
    amount: number;
    streak: number;
  }>> => {
    return apiFetch('/tokens/claim-daily', { method: 'POST' });
  };

  const getEarningsBreakdown = async (): Promise<ApiResponse<{
    verifications: number;
    posts: number;
    referrals: number;
    bonuses: number;
  }>> => {
    return apiFetch('/tokens/earnings');
  };

  return {
    getBalance,
    getTransactions,
    transfer,
    claimDailyBonus,
    getEarningsBreakdown,
  };
};

// ============================================
// LEADERBOARD HOOKS
// ============================================

export const useLeaderboard = () => {
  const getLeaderboard = async (
    period: 'daily' | 'weekly' | 'monthly' | 'allTime' = 'weekly',
    category: 'verifications' | 'accuracy' | 'tokens' = 'verifications',
    limit: number = 100
  ): Promise<ApiResponse<{
    entries: LeaderboardEntry[];
    myRank?: number;
  }>> => {
    const params = new URLSearchParams({ period, category, limit: limit.toString() });
    return apiFetch(`/leaderboard?${params}`);
  };

  const getMyRank = async (
    category: 'verifications' | 'accuracy' | 'tokens' = 'verifications'
  ): Promise<ApiResponse<{
    rank: number;
    percentile: number;
    value: number;
  }>> => {
    return apiFetch(`/leaderboard/me?category=${category}`);
  };

  return {
    getLeaderboard,
    getMyRank,
  };
};

// ============================================
// REPORT HOOKS
// ============================================

export const useReport = () => {
  const reportContent = async (
    type: 'post' | 'user' | 'comment' | 'message',
    targetId: string,
    reason: string,
    details?: string
  ): Promise<ApiResponse<void>> => {
    return apiFetch<void>('/reports', {
      method: 'POST',
      body: JSON.stringify({ type, targetId, reason, details }),
    });
  };

  return {
    reportContent,
  };
};

// ============================================
// EXPORT ALL HOOKS
// ============================================

export const useApi = () => ({
  auth: useAuth(),
  posts: usePosts(),
  verification: useVerification(),
  users: useUsers(),
  notifications: useNotifications(),
  messages: useMessages(),
  search: useSearch(),
  tokens: useTokens(),
  leaderboard: useLeaderboard(),
  report: useReport(),
});

export default useApi;