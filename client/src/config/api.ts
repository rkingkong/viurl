import axios from 'axios';

// API base URL - will use proxy in development
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        });
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },
  posts: {
    list: '/posts',
    create: '/posts',
    like: (id: string) => `/posts/${id}/like`,
    verify: (id: string) => `/posts/${id}/verify`,
    retweet: (id: string) => `/posts/${id}/retweet`,
    comment: (id: string) => `/posts/${id}/comment`,
  },
  users: {
    profile: (username: string) => `/users/${username}`,
    follow: (id: string) => `/users/${id}/follow`,
    followers: (id: string) => `/users/${id}/followers`,
    following: (id: string) => `/users/${id}/following`,
  },
  tokens: {
    balance: '/tokens/balance',
    claim: '/tokens/claim',
    history: '/tokens/history',
  },
};

export default api;
