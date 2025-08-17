export interface User {
  _id: string;
  username: string;
  email: string;
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  darkMode?: boolean;
  followers: string[];
  following: string[];
  createdAt: string;
}

export interface Post {
  _id: string;
  author: User;
  content: string;
  likes: string[];
  retweets: string[];
  comments: Comment[];
  media?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface UserState {
  currentUser: User | null;
  darkMode: boolean;
  profile: User | null;
  loading: boolean;
  error: string | null;
}

export interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}
