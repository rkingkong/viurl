// VIURL TypeScript Types

export interface User {
  _id: string;
  id?: string;
  email: string;
  username: string;
  name: string;
  profilePicture?: string;
  bannerImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  trustScore: number;
  vtokens: number;
  badge?: 'bronze' | 'silver' | 'gold' | 'diamond';
  followers: string[];
  following: string[];
  verifiedPosts?: string[];
  joinedDate?: string;
  createdAt: string;
  updatedAt?: string;
  isVerified?: boolean;
  loginStreak?: number;
  lastLoginDate?: string;
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
}
