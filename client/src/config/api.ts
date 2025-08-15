// api.ts - API Configuration for Viurl
import axios from 'axios';

// Use production URL when deployed, localhost for development
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://viurl.com/api'
  : 'http://localhost:5000/api';

// For now, since your backend is running on the EC2 instance, use this:
// export const API_BASE_URL = 'https://viurl.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('viurl_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('viurl_token');
      localStorage.removeItem('viurl_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// WebSocket configuration for real-time features
export const WS_URL = process.env.NODE_ENV === 'production'
  ? 'wss://viurl.com'
  : 'ws://localhost:5000';

// Export specific API endpoints
export const endpoints = {
  // Auth endpoints
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  me: '/auth/me',
  refreshToken: '/auth/refresh',
  
  // User endpoints
  getProfile: (userId: string) => `/users/${userId}`,
  updateProfile: '/users/profile',
  followUser: (userId: string) => `/users/${userId}/follow`,
  unfollowUser: (userId: string) => `/users/${userId}/unfollow`,
  searchUsers: '/users/search',
  
  // Post endpoints
  createPost: '/posts',
  getPosts: '/posts',
  getPost: (postId: string) => `/posts/${postId}`,
  deletePost: (postId: string) => `/posts/${postId}`,
  verifyPost: (postId: string) => `/posts/${postId}/verify`,
  unverifyPost: (postId: string) => `/posts/${postId}/unverify`,
  
  // Feed endpoints
  getHomeFeed: '/feed/home',
  getExploreFeed: '/feed/explore',
  getTrending: '/feed/trending',
  
  // Comment endpoints
  getComments: (postId: string) => `/posts/${postId}/comments`,
  createComment: (postId: string) => `/posts/${postId}/comments`,
  deleteComment: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}`,
  
  // Notification endpoints
  getNotifications: '/notifications',
  markAsRead: (notificationId: string) => `/notifications/${notificationId}/read`,
  markAllAsRead: '/notifications/read-all',
  
  // Token endpoints (VTOKEN system)
  getBalance: '/tokens/balance',
  getTransactions: '/tokens/transactions',
  transferTokens: '/tokens/transfer',
  
  // Trust Score endpoints
  getTrustScore: (userId: string) => `/trust/${userId}`,
  getTrustHistory: (userId: string) => `/trust/${userId}/history`,
};

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
};