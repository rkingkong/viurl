// api.ts - API Configuration for Viurl Frontend
import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // Check if we're in production (deployed)
  if (window.location.hostname === 'viurl.com') {
    return 'https://viurl.com/api';
  }
  
  // Check if we're accessing via IP
  if (window.location.hostname === '18.222.211.175') {
    return 'http://18.222.211.175:5000/api';
  }
  
  // Local development
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiUrl();

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
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('viurl_token');
      localStorage.removeItem('viurl_user');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Extract error message
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'An unexpected error occurred';
    
    // Create a more user-friendly error
    const enhancedError = {
      ...error,
      userMessage: message,
      status: error.response?.status,
    };
    
    return Promise.reject(enhancedError);
  }
);

export default api;

// WebSocket configuration for real-time features (future implementation)
export const WS_URL = window.location.hostname === 'viurl.com'
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
  getFollowers: (userId: string) => `/users/${userId}/followers`,
  getFollowing: (userId: string) => `/users/${userId}/following`,
  
  // Post endpoints
  createPost: '/posts',
  getPosts: '/posts',
  getUserPosts: (userId: string) => `/posts/user/${userId}`,
  getPost: (postId: string) => `/posts/${postId}`,
  deletePost: (postId: string) => `/posts/${postId}`,
  likePost: (postId: string) => `/posts/${postId}/like`,
  unlikePost: (postId: string) => `/posts/${postId}/unlike`,
  repost: (postId: string) => `/posts/${postId}/repost`,
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
  
  // Health check
  health: '/health',
  test: '/test',
};

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.userMessage) {
    return error.userMessage;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

// Helper function for making API calls with better error handling
export const apiCall = async <T = any>(
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  data?: any
): Promise<T> => {
  try {
    const response = await api[method](endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`API Call Failed: ${method.toUpperCase()} ${endpoint}`, error);
    throw error;
  }
};

// Export types for TypeScript
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  username: string;
  profilePicture?: string;
  bannerImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  trustScore: number;
  vtokens: number;
  isVerified: boolean;
  joinedDate: string;
  followers: number;
  following: number;
}

export interface Post {
  _id: string;
  user: User | string;
  content: string;
  media?: string[];
  likes: string[];
  reposts: string[];
  comments: number;
  verifications: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}