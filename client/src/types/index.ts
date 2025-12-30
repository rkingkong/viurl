// VIURL TypeScript Types - Complete

export interface User {
  _id: string;
  id?: string;
  email: string;
  username: string;
  name: string;
  profilePicture?: string;
  avatar?: string;
  bannerImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  trustScore: number;
  vtokens: number;
  badge?: 'bronze' | 'silver' | 'gold' | 'diamond';
  verificationBadge?: string;
  followers: string[];
  following: string[];
  verifiedPosts?: string[];
  joinedDate?: string;
  createdAt: string;
  updatedAt?: string;
  isVerified?: boolean;
  loginStreak?: number;
  lastLoginDate?: string;
  notifications?: number;
}

export interface UserState {
  currentUser: User | null;
  profileUser: User | null;
  loading: boolean;
  error: string | null;
}

export interface Post {
  _id: string;
  id?: string;
  author: User;
  content: string;
  media?: MediaItem[];
  likes: string[];
  comments: Comment[];
  reposts: number;
  repostedBy?: string[];
  bookmarks?: number;
  bookmarkedBy?: string[];
  verifications: string[];
  verificationStatus?: 'pending' | 'verified' | 'disputed' | 'false';
  verificationScore?: number;
  verificationCount?: number;
  factCheckStatus?: string;
  commentCount?: number;
  likeCount?: number;
  shareCount?: number;
  hashtags?: string[];
  mentions?: string[];
  poll?: Poll;
  isRepost?: boolean;
  originalPost?: Post;
  isLikedByMe?: boolean;
  isRepostedByMe?: boolean;
  isBookmarkedByMe?: boolean;
  isVerifiedByMe?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MediaItem {
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail?: string;
  alt?: string;
}

export interface Poll {
  question: string;
  options: PollOption[];
  endsAt: string;
  totalVotes: number;
  hasVoted?: boolean;
  votedOption?: number;
}

export interface PollOption {
  text: string;
  votes: number;
  percentage?: number;
}

export interface Comment {
  _id: string;
  id?: string;
  author: User;
  content: string;
  likes: string[];
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  refreshing: boolean;
}

export interface Notification {
  _id: string;
  id?: string;
  type: string;
  from: User;
  post?: Post;
  message?: string;
  amount?: number;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  id?: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  _id: string;
  id?: string;
  conversation: string;
  sender: User;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface PostCardProps {
  post: Post;
  onVerify?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export interface CreatePostProps {
  onPostCreated?: () => void;
  replyTo?: Post;
  placeholder?: string;
}

export interface Verification {
  _id: string;
  id?: string;
  post: string;
  verifier: User;
  verdict: string;
  confidence: number;
  evidence: Evidence[];
  reasoning: string;
  tokensEarned: number;
  createdAt: string;
}

export interface Evidence {
  type: string;
  url?: string;
  title: string;
  description?: string;
}

export interface VerificationSubmission {
  postId: string;
  verdict: string;
  confidence: number;
  evidence: Evidence[];
  reasoning: string;
}

export interface CreatePostData {
  content: string;
  media?: File[];
  poll?: object;
}

export interface EditProfileData {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  profilePicture?: string;
}

export interface TokenTransaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface SearchResult {
  users: User[];
  posts: Post[];
  hashtags: TrendingTopic[];
}

export interface TrendingTopic {
  hashtag: string;
  postCount: number;
  category?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
}

export interface SendMessageData {
  conversationId?: string;
  recipientId?: string;
  content: string;
}
