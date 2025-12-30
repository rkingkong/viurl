import { useState, useCallback } from 'react';
import type {
  User,
  Post,
  Notification,
  Conversation,
  Message,
  LoginCredentials,
  RegisterData,
  CreatePostData,
  EditProfileData,
  VerificationSubmission,
  TokenTransaction,
  ApiResponse,
  PaginatedResponse,
  SearchResult,
  TrendingTopic,
  LeaderboardEntry,
  SendMessageData,
} from '../types';

const API_BASE = '/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...getAuthHeaders(), ...options?.headers },
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message || 'Request failed' };
    return { success: true, data: data.data || data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

export function useAuthApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    const result = await apiFetch<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setLoading(false);
    if (!result.success) setError(result.error || 'Login failed');
    return result;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    const result = await apiFetch<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!result.success) setError(result.error || 'Registration failed');
    return result;
  }, []);

  return { login, register, loading, error };
}

export function usePostsApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFeed = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    const result = await apiFetch<PaginatedResponse<Post>>(`/posts?page=${page}&limit=${limit}`);
    setLoading(false);
    return result;
  }, []);

  const getPost = useCallback(async (postId: string) => {
    return apiFetch<Post>(`/posts/${postId}`);
  }, []);

  const createPost = useCallback(async (data: CreatePostData) => {
    setLoading(true);
    setError(null);

    if (data.media && data.media.length > 0) {
      const formData = new FormData();
      formData.append('content', data.content);
      data.media.forEach((file: File) => formData.append('media', file));

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const response = await fetch(`${API_BASE}/posts`, {
          method: 'POST',
          headers,
          body: formData,
        });
        const result = await response.json();
        setLoading(false);
        return { success: response.ok, data: result };
      } catch {
        setLoading(false);
        setError('Failed to create post');
        return { success: false, error: 'Failed to create post' };
      }
    }

    const result = await apiFetch<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!result.success) setError(result.error || 'Failed to create post');
    return result;
  }, []);

  const likePost = useCallback(async (postId: string) => {
    return apiFetch<Post>(`/posts/${postId}/like`, { method: 'POST' });
  }, []);

  const repostPost = useCallback(async (postId: string) => {
    return apiFetch<Post>(`/posts/${postId}/repost`, { method: 'POST' });
  }, []);

  const bookmarkPost = useCallback(async (postId: string) => {
    return apiFetch<Post>(`/posts/${postId}/bookmark`, { method: 'POST' });
  }, []);

  return { getFeed, getPost, createPost, likePost, repostPost, bookmarkPost, loading, error };
}

export function useVerificationApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVerification = useCallback(async (data: VerificationSubmission) => {
    setLoading(true);
    setError(null);
    const result = await apiFetch<{ tokensEarned: number }>('/verification/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!result.success) setError(result.error || 'Verification failed');
    return result;
  }, []);

  return { submitVerification, loading, error };
}

export function useTokensApi() {
  const [loading, setLoading] = useState(false);

  const getBalance = useCallback(async () => {
    return apiFetch<{ available: number; staked: number }>('/tokens/balance');
  }, []);

  const getHistory = useCallback(async (page = 1) => {
    return apiFetch<PaginatedResponse<TokenTransaction>>(`/tokens/history?page=${page}`);
  }, []);

  const claimDailyBonus = useCallback(async () => {
    setLoading(true);
    const result = await apiFetch<{ amount: number; streak: number }>('/tokens/daily-bonus', { method: 'POST' });
    setLoading(false);
    return result;
  }, []);

  return { getBalance, getHistory, claimDailyBonus, loading };
}

export function useUsersApi() {
  const [loading, setLoading] = useState(false);

  const getUser = useCallback(async (userId: string) => {
    return apiFetch<User>(`/users/${userId}`);
  }, []);

  const updateProfile = useCallback(async (data: EditProfileData) => {
    setLoading(true);
    const result = await apiFetch<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setLoading(false);
    return result;
  }, []);

  const followUser = useCallback(async (userId: string) => {
    return apiFetch<User>(`/users/${userId}/follow`, { method: 'POST' });
  }, []);

  const unfollowUser = useCallback(async (userId: string) => {
    return apiFetch<User>(`/users/${userId}/follow`, { method: 'DELETE' });
  }, []);

  return { getUser, updateProfile, followUser, unfollowUser, loading };
}

export function useSearchApi() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    const result = await apiFetch<SearchResult>(`/search?q=${encodeURIComponent(query)}`);
    setLoading(false);
    if (result.success && result.data) setResults(result.data);
    return result;
  }, []);

  const getTrending = useCallback(async () => {
    return apiFetch<TrendingTopic[]>('/trending');
  }, []);

  return { search, getTrending, loading, results };
}

export function useNotificationsApi() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getNotifications = useCallback(async (page = 1) => {
    setLoading(true);
    const result = await apiFetch<{ notifications: Notification[]; unreadCount: number }>(`/notifications?page=${page}`);
    setLoading(false);
    if (result.success && result.data) {
      setNotifications(result.data.notifications);
      setUnreadCount(result.data.unreadCount);
    }
    return result;
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    const result = await apiFetch<Notification>(`/notifications/${id}/read`, { method: 'PUT' });
    if (result.success) {
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    return result;
  }, []);

  return { getNotifications, markAsRead, notifications, unreadCount, loading };
}

export function useMessagesApi() {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const getConversations = useCallback(async () => {
    setLoading(true);
    const result = await apiFetch<Conversation[]>('/messages/conversations');
    setLoading(false);
    if (result.success && result.data) setConversations(result.data);
    return result;
  }, []);

  const getMessages = useCallback(async (conversationId: string, page = 1) => {
    return apiFetch<PaginatedResponse<Message>>(`/messages/${conversationId}?page=${page}`);
  }, []);

  const sendMessage = useCallback(async (data: SendMessageData) => {
    setLoading(true);
    const result = await apiFetch<Message>('/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setLoading(false);
    return result;
  }, []);

  return { getConversations, getMessages, sendMessage, conversations, loading };
}

export function useLeaderboardApi() {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const getLeaderboard = useCallback(async (type = 'verifiers') => {
    setLoading(true);
    const result = await apiFetch<{ entries: LeaderboardEntry[] }>(`/leaderboard?type=${type}`);
    setLoading(false);
    if (result.success && result.data) setEntries(result.data.entries);
    return result;
  }, []);

  return { getLeaderboard, entries, loading };
}

export default {
  useAuthApi,
  usePostsApi,
  useVerificationApi,
  useTokensApi,
  useUsersApi,
  useSearchApi,
  useNotificationsApi,
  useMessagesApi,
  useLeaderboardApi,
};
