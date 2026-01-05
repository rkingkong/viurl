// types/index.ts - VIURL Complete TypeScript Definitions
// Location: client/src/types/index.ts

// ============================================
// USER TYPES
// ============================================

export type VerificationBadge = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export type Theme = 'light' | 'dark' | 'auto';

export interface UserSettings {
  theme: Theme;
  emailNotifications: boolean;
  pushNotifications: boolean;
  privateProfile: boolean;
  showTrustScore: boolean;
  allowDMs: 'everyone' | 'followers' | 'verified' | 'none';
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  profilePicture?: string;
  bannerImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthdate?: string;
  createdAt: string;
  
  // VIURL Specific
  trustScore: number;
  vtokens: number;
  isVerified: boolean;
  verificationBadge: VerificationBadge;
  
  // Social Stats
  followers: number;
  following: number;
  postsCount: number;
  verificationsCount: number;
  
  // Relationships (for logged-in user context)
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  isBlocked?: boolean;
  isMuted?: boolean;
  
  // Settings
  settings?: UserSettings;
}

export interface UserProfile extends User {
  followersList?: string[];
  followingList?: string[];
  pinnedPost?: Post;
  recentVerifications?: Verification[];
}

export interface UserSummary {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
  trustScore: number;
  verificationBadge: VerificationBadge;
  isFollowing?: boolean;
}

// ============================================
// POST TYPES
// ============================================

export type FactCheckStatus = 'unverified' | 'true' | 'false' | 'misleading' | 'partially_true';

export type PostVisibility = 'public' | 'followers' | 'verified' | 'private';

export type MediaType = 'image' | 'video' | 'gif';

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number; // for video
  altText?: string;
}

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

export interface FactCheckDetails {
  checkedBy: UserSummary;
  checkedAt: string;
  sources: string[];
  explanation: string;
  confidence: number;
}

export interface Post {
  id: string;
  author: UserSummary;
  content: string;
  media?: Media[];
  poll?: Poll;
  createdAt: string;
  updatedAt?: string;
  
  // VIURL Verification System
  verificationCount: number;
  factCheckStatus: FactCheckStatus;
  factCheckDetails?: FactCheckDetails;
  trustScore: number;
  
  // Engagement
  commentCount: number;
  repostCount: number;
  bookmarkCount: number;
  
  // User State (for logged-in user)
  isVerifiedByMe?: boolean;
  isRepostedByMe?: boolean;
  isBookmarkedByMe?: boolean;
  isLikedByMe?: boolean;
  
  // Post Relationships
  replyTo?: PostSummary;
  quotedPost?: PostSummary;
  
  // Metadata
  hashtags?: string[];
  mentions?: string[];
  visibility: PostVisibility;
  
  // Token Rewards
  tokenRewards?: {
    total: number;
    distributed: boolean;
  };
}

export interface PostSummary {
  id: string;
  author: UserSummary;
  content: string;
  factCheckStatus: FactCheckStatus;
  createdAt: string;
}

export interface CreatePostData {
  content: string;
  media?: File[];
  poll?: {
    options: string[];
    duration: number;
  };
  visibility: PostVisibility;
  replyTo?: string;
  quotedPost?: string;
}

// ============================================
// VERIFICATION TYPES
// ============================================

export type Verdict = 'true' | 'false' | 'misleading' | 'partially_true';

export interface VerificationSource {
  url: string;
  title?: string;
  domain?: string;
  credibilityScore?: number;
}

export interface Verification {
  id: string;
  postId: string;
  userId: string;
  user: UserSummary;
  verdict: Verdict;
  sources: VerificationSource[];
  explanation: string;
  createdAt: string;
  
  // Rewards
  tokenReward: number;
  rewardClaimed: boolean;
  
  // Community Response
  upvotes: number;
  downvotes: number;
  isUpvotedByMe?: boolean;
  isDownvotedByMe?: boolean;
}

export interface VerificationSubmission {
  postId: string;
  verdict: Verdict;
  sources: string[];
  explanation: string;
}

export interface VerificationStats {
  totalVerifications: number;
  accuracyRate: number;
  tokensEarned: number;
  verdictBreakdown: {
    true: number;
    false: number;
    misleading: number;
    partially_true: number;
  };
  rank?: number;
  percentile?: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'verification'
  | 'verified_your_post'
  | 'token_reward'
  | 'follow'
  | 'mention'
  | 'repost'
  | 'comment'
  | 'reply'
  | 'badge'
  | 'milestone'
  | 'system'
  | 'dm';

export interface Notification {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  
  // Source user (who triggered it)
  fromUser?: UserSummary;
  
  // Related content
  post?: PostSummary;
  comment?: {
    id: string;
    content: string;
  };
  
  // Type-specific data
  verdict?: Verdict;
  tokenAmount?: number;
  tokenReason?: string;
  badgeType?: VerificationBadge;
  milestoneType?: string;
  milestoneValue?: number;
  systemMessage?: string;
}

export interface NotificationSettings {
  push: {
    verifications: boolean;
    follows: boolean;
    mentions: boolean;
    reposts: boolean;
    comments: boolean;
    messages: boolean;
    tokenRewards: boolean;
  };
  email: {
    verifications: boolean;
    follows: boolean;
    weeklyDigest: boolean;
    tokenRewards: boolean;
    securityAlerts: boolean;
  };
}

// ============================================
// MESSAGE TYPES
// ============================================

export type MessageType = 'text' | 'image' | 'post_share' | 'verification_share' | 'gif';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  timestamp: string;
  read: boolean;
  readAt?: string;
  
  // Shared content
  sharedPost?: PostSummary;
  sharedVerification?: {
    id: string;
    postId: string;
    verdict: Verdict;
  };
  media?: Media;
  
  // Status
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Conversation {
  id: string;
  participants: UserSummary[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
  
  // For DMs (1-on-1)
  participant?: UserSummary & {
    isOnline?: boolean;
    lastSeen?: string;
  };
  
  // Settings
  isMuted?: boolean;
  isPinned?: boolean;
}

export interface SendMessageData {
  conversationId?: string;
  recipientId?: string;
  content: string;
  type: MessageType;
  sharedPostId?: string;
  media?: File;
}

// ============================================
// AUTH TYPES
// ============================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  name: string;
  password: string;
  birthdate?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokens?: AuthTokens;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

// ============================================
// FEED TYPES
// ============================================

export type FeedType = 'forYou' | 'following' | 'verified' | 'trending';

export interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  cursor?: string;
  feedType: FeedType;
}

export interface FeedFilters {
  factCheckStatus?: FactCheckStatus[];
  minTrustScore?: number;
  hasMedia?: boolean;
  hasPoll?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// ============================================
// SEARCH TYPES
// ============================================

export type SearchType = 'all' | 'posts' | 'users' | 'hashtags';

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
// TRENDING TYPES
// ============================================

export interface TrendingTopic {
  id: string;
  hashtag: string;
  category: string;
  postCount: number;
  verificationRate: number;
  change24h?: number; // percentage change
}

export interface TrendingUser {
  user: UserSummary;
  rank: number;
  tokensEarned: number;
  verificationsCount: number;
  change?: number; // rank change
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';

export type LeaderboardCategory = 'verifications' | 'accuracy' | 'tokens' | 'followers';

export interface LeaderboardEntry {
  rank: number;
  user: UserSummary;
  value: number;
  change?: number;
}

export interface Leaderboard {
  period: LeaderboardPeriod;
  category: LeaderboardCategory;
  entries: LeaderboardEntry[];
  myRank?: number;
  updatedAt: string;
}

// ============================================
// TOKEN TYPES
// ============================================

export type TransactionType = 
  | 'verification_reward'
  | 'post_reward'
  | 'referral_bonus'
  | 'daily_bonus'
  | 'milestone_bonus'
  | 'transfer_in'
  | 'transfer_out'
  | 'badge_bonus';

export interface TokenTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
  
  // Related entities
  relatedPostId?: string;
  relatedUserId?: string;
  relatedVerificationId?: string;
}

export interface TokenWallet {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: TokenTransaction[];
}

export interface TokenTransfer {
  recipientUsername: string;
  amount: number;
  note?: string;
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

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// ============================================
// REDUX STATE TYPES
// ============================================

export interface RootState {
  auth: AuthState;
  feed: FeedState;
  search: SearchState;
  notifications: {
    items: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
  };
  messages: {
    conversations: Conversation[];
    activeConversation: Conversation | null;
    messages: Record<string, Message[]>;
    unreadCount: number;
    loading: boolean;
    error: string | null;
  };
  ui: {
    theme: Theme;
    sidebarCollapsed: boolean;
    createPostModalOpen: boolean;
    activeModal: string | null;
  };
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface NavigateFunction {
  (page: string, params?: Record<string, string>): void;
}

export interface BasePageProps {
  onNavigate: NavigateFunction;
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
// WEBSOCKET EVENT TYPES
// ============================================

export type WebSocketEventType = 
  | 'new_message'
  | 'message_read'
  | 'typing_start'
  | 'typing_stop'
  | 'user_online'
  | 'user_offline'
  | 'new_notification'
  | 'post_verified'
  | 'token_received';

export interface WebSocketEvent<T = any> {
  type: WebSocketEventType;
  payload: T;
  timestamp: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type SortOrder = 'asc' | 'desc';

export type DateRange = {
  start: Date;
  end: Date;
};

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  name: string;
  coordinates?: Coordinates;
}

// Type guards
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.username === 'string' && typeof obj.trustScore === 'number';
};

export const isPost = (obj: any): obj is Post => {
  return obj && typeof obj.content === 'string' && typeof obj.author === 'object';
};

export const isVerification = (obj: any): obj is Verification => {
  return obj && typeof obj.verdict === 'string' && typeof obj.postId === 'string';
};