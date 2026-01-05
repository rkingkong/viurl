// types/index.ts - VIURL Complete TypeScript Definitions
// Location: client/src/types/index.ts
// VERSION: Fixed to match all existing slices and components

// ============================================
// BADGE & SETTING TYPES
// ============================================

export type VerificationBadge = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
export type Theme = 'light' | 'dark' | 'auto';
export type FactCheckStatus = 'unverified' | 'true' | 'false' | 'misleading' | 'partially_true';
export type PostVisibility = 'public' | 'followers' | 'verified' | 'private';
export type MediaType = 'image' | 'video' | 'gif';
export type FeedType = 'forYou' | 'following' | 'verified' | 'trending';
export type NotificationType = 'verification' | 'follow' | 'mention' | 'repost' | 'comment' | 'badge' | 'token' | 'system' | 'message' | 'like';
export type MessageType = 'text' | 'image' | 'video' | 'gif' | 'post_share' | 'verification_share';
export type SearchType = 'all' | 'posts' | 'users' | 'hashtags';

// ============================================
// USER SETTINGS
// ============================================

export interface UserSettings {
  theme: Theme;
  emailNotifications: boolean;
  pushNotifications: boolean;
  privateProfile: boolean;
  showTrustScore: boolean;
  allowDMs: 'everyone' | 'followers' | 'verified' | 'none';
}

// ============================================
// USER TYPES
// ============================================

export interface User {
  _id: string;
  id?: string;
  email: string;
  username: string;
  name: string;
  profilePicture?: string;
  avatar?: string;  // Alias for profilePicture (frontend compatibility)
  bannerImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthdate?: string;
  createdAt: string;
  updatedAt?: string;
  joinedDate?: string;
  
  // VIURL Specific
  trustScore: number;
  vtokens: number;
  isVerified: boolean;
  verificationBadge: VerificationBadge;
  
  // Social Stats
  followers: number | string[];
  following: number | string[];
  postsCount?: number;
  verificationsCount?: number;
  
  // Arrays
  followersList?: string[];
  followingList?: string[];
  verifiedPosts?: string[];
  bookmarks?: string[];
  posts?: string[];
  notifications?: { type: string; from?: string; post?: string; message?: string; read: boolean; createdAt: string; }[];
  
  // Relationships
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  isBlocked?: boolean;
  isMuted?: boolean;
  
  // Settings
  settings?: UserSettings;
}

export interface UserSummary {
  _id: string;
  id?: string;
  username: string;
  name: string;
  email?: string;
  profilePicture?: string;
  avatar?: string;
  trustScore: number;
  vtokens?: number;
  verificationBadge?: VerificationBadge;
  isFollowing?: boolean;
  followers?: string[] | number;
  following?: string[] | number;
  joinedDate?: string;
  createdAt?: string;
}

export interface UserProfile extends User {
  pinnedPost?: Post;
  recentVerifications?: Verification[];
}

// ============================================
// AUTH STATE (matches authSlice.ts)
// ============================================

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface RegisterData extends RegisterCredentials {
  birthdate?: string;
}

// ============================================
// USER STATE (matches userSlice.ts)
// ============================================

export interface UserState {
  currentUser: User | null;
  profileUser: User | null;
  profile: User | null;
  darkMode: boolean;
  loading: boolean;
  error: string | null;
}

// ============================================
// MEDIA TYPES
// ============================================

export interface Media {
  id?: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  altText?: string;
}

// ============================================
// POLL TYPES
// ============================================

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
}

export interface Poll {
  id: string;
  options: PollOption[];
  totalVotes: number;
  endsAt: string;
  hasVoted?: boolean;
  votedOptionId?: string;
}

// ============================================
// POST TYPES
// ============================================

export interface Post {
  _id: string;
  id?: string;
  author: UserSummary;
  user?: UserSummary;  // Alias for author
  content: string;
  media?: Media[];
  poll?: Poll;
  createdAt: string;
  updatedAt?: string;
  
  // VIURL Verification
  verificationCount: number;
  verifications?: string[];
  factCheckStatus: FactCheckStatus;
  trustScore: number;
  isVerified?: boolean;
  
  // Engagement counts
  commentCount: number;
  repostCount: number;
  bookmarkCount: number;
  comments?: number;
  reposts?: number;
  bookmarks?: number;
  likes?: string[];
  
  // Arrays for tracking who did what
  verifiedBy?: string[];
  repostedBy?: string[];
  bookmarkedBy?: string[];
  
  // User State
  isVerifiedByMe?: boolean;
  isRepostedByMe?: boolean;
  isBookmarkedByMe?: boolean;
  isLikedByMe?: boolean;
  
  // Relationships
  replyTo?: Post | string;
  quotedPost?: Post | string;
  
  // Metadata
  hashtags?: string[];
  mentions?: string[];
  visibility?: PostVisibility;
  
  // Fact Check Details
  factCheckDetails?: {
    checkedBy?: string;
    checkedAt?: string;
    sources?: string[];
    explanation?: string;
  };
}

export interface PostSummary {
  _id: string;
  id?: string;
  content: string;
  author: UserSummary;
  createdAt: string;
  factCheckStatus: FactCheckStatus;
  verificationCount: number;
}

export interface CreatePostData {
  content: string;
  media?: File[];
  poll?: {
    options: string[];
    duration: number;
  };
  visibility?: PostVisibility;
  replyTo?: string;
  quotedPost?: string;
}

// ============================================
// VERIFICATION TYPES
// ============================================

export interface Verification {
  _id: string;
  id?: string;
  user: UserSummary;
  post: string | PostSummary;
  verdict: 'true' | 'false' | 'misleading' | 'partially_true';
  confidence: number;
  sources: VerificationSource[];
  explanation: string;
  tokensEarned: number;
  createdAt: string;
  upvotes?: number;
  downvotes?: number;
  isHelpful?: boolean;
}

export interface VerificationSource {
  url: string;
  title?: string;
  domain?: string;
  credibilityScore?: number;
  isOfficial?: boolean;
}

export interface SubmitVerificationData {
  postId: string;
  verdict: 'true' | 'false' | 'misleading' | 'partially_true';
  confidence: number;
  sources: string[];
  explanation: string;
}

export interface VerificationResult {
  verification: Verification;
  tokensEarned: number;
  newTrustScore: number;
  badgeEarned?: VerificationBadge;
  consensusReached?: boolean;
  postStatus?: FactCheckStatus;
}

// ============================================
// COMMENT TYPES
// ============================================

export interface Comment {
  _id: string;
  id?: string;
  author: UserSummary;
  post: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes?: string[];
  likeCount: number;
  isLikedByMe?: boolean;
  replyTo?: string;
  replies?: Comment[];
}

// ============================================
// TOKEN TYPES
// ============================================

export interface TokenBalance {
  available: number;
  staked: number;
  pending: number;
  total: number;
}

export interface TokenTransaction {
  _id: string;
  id?: string;
  type: 'earned' | 'spent' | 'transferred' | 'received' | 'staked' | 'unstaked' | 'reward' | 'bonus';
  amount: number;
  description: string;
  reference?: string;
  createdAt: string;
  from?: UserSummary;
  to?: UserSummary;
}

export interface DailyBonus {
  available: boolean;
  amount: number;
  streak: number;
  lastClaimed?: string;
  nextBonus: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  _id: string;
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actor?: UserSummary;
  post?: PostSummary;
  data?: Record<string, unknown>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  _id: string;
  id?: string;
  conversation: string;
  sender: UserSummary;
  content: string;
  type: MessageType;
  createdAt: string;
  readAt?: string;
  sharedPost?: PostSummary;
  media?: Media;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Conversation {
  _id: string;
  id?: string;
  participants: UserSummary[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
  participant?: UserSummary;
  isMuted?: boolean;
  isPinned?: boolean;
}

export interface SendMessageData {
  conversationId?: string;
  recipientId?: string;
  content: string;
  type?: MessageType;
  sharedPostId?: string;
  media?: File;
}

// ============================================
// FEED STATE (matches feedSlice.ts)
// ============================================

export interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  cursor?: string;
  feedType: FeedType;
  refreshing: boolean;
}

// ============================================
// SEARCH TYPES
// ============================================

export interface SearchResult {
  type: 'user' | 'post' | 'hashtag';
  user?: UserSummary;
  post?: PostSummary;
  hashtag?: {
    tag: string;
    postCount: number;
    trending?: boolean;
  };
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  searchType: SearchType;
}

// ============================================
// TRENDING & LEADERBOARD TYPES
// ============================================

export interface TrendingTopic {
  id: string;
  hashtag: string;
  category: string;
  postCount: number;
  verificationRate: number;
  change24h?: number;
}

export interface TrendingUser {
  user: UserSummary;
  rank: number;
  tokensEarned: number;
  verificationsCount: number;
  change?: number;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';
export type LeaderboardCategory = 'verifications' | 'accuracy' | 'tokens' | 'followers';

export interface LeaderboardEntry {
  rank: number;
  user: UserSummary;
  value: number;
  change?: number;
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  cursor?: string;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface NavigateFunction {
  (page: string, params?: Record<string, string>): void;
}

export interface BasePageProps {
  onNavigate?: NavigateFunction;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================
// FORM TYPES
// ============================================

export interface EditProfileData {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  profilePicture?: File;
  bannerImage?: File;
}

export interface ReportData {
  type: 'post' | 'user' | 'comment' | 'message';
  targetId: string;
  reason: string;
  details?: string;
}
// ============================================
// VERIFICATION SUBMISSION
// ============================================

export interface VerificationSubmission {
  postId: string;
  verdict: 'true' | 'false' | 'misleading' | 'partially_true';
  explanation: string;
  sources?: string[];
}
