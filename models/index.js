// models/index.js - VIURL Complete MongoDB Models
// Location: /var/www/viurl/src/models/index.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============================================
// USER MODEL
// ============================================

const userSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include in queries by default
  },
  
  // Profile
  profilePicture: {
    type: String,
    default: null
  },
  bannerImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 160,
    default: ''
  },
  location: {
    type: String,
    maxlength: 100,
    default: ''
  },
  website: {
    type: String,
    maxlength: 200,
    default: ''
  },
  birthdate: {
    type: Date,
    default: null
  },
  
  // VIURL Specific - Trust & Verification
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
    index: true
  },
  vtokens: {
    type: Number,
    default: 10, // Welcome bonus
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationBadge: {
    type: String,
    enum: ['none', 'bronze', 'silver', 'gold', 'platinum'],
    default: 'none',
    index: true
  },
  
  // Stats
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  postsCount: {
    type: Number,
    default: 0
  },
  verificationsCount: {
    type: Number,
    default: 0
  },
  
  // Arrays for relationships
  followersList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followingList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mutedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Posts user has verified
  verifiedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  
  // Bookmarked posts
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  
  // Settings
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    privateProfile: {
      type: Boolean,
      default: false
    },
    showTrustScore: {
      type: Boolean,
      default: true
    },
    allowDMs: {
      type: String,
      enum: ['everyone', 'followers', 'verified', 'none'],
      default: 'everyone'
    }
  },
  
  // Notification settings
  notificationSettings: {
    push: {
      verifications: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      reposts: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      tokenRewards: { type: Boolean, default: true }
    },
    email: {
      verifications: { type: Boolean, default: true },
      follows: { type: Boolean, default: false },
      weeklyDigest: { type: Boolean, default: true },
      tokenRewards: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true }
    }
  },
  
  // Metadata for milestones, etc.
  metadata: {
    claimedMilestones: [String],
    referralCode: String,
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastLogin: Date,
    loginStreak: { type: Number, default: 0 }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedUntil: Date,
  suspensionReason: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ trustScore: -1 });
userSchema.index({ verificationsCount: -1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate referral code
userSchema.methods.generateReferralCode = function() {
  return `${this.username.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

const User = mongoose.model('User', userSchema);

// ============================================
// POST MODEL
// ============================================

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 280
  },
  
  // Media attachments
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'gif']
    },
    url: String,
    thumbnail: String,
    width: Number,
    height: Number,
    duration: Number, // For video
    altText: String
  }],
  
  // Poll
  poll: {
    options: [{
      id: String,
      text: String,
      votes: { type: Number, default: 0 }
    }],
    totalVotes: { type: Number, default: 0 },
    endsAt: Date,
    voters: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      optionId: String
    }]
  },
  
  // VIURL Verification System
  verificationCount: {
    type: Number,
    default: 0,
    index: true
  },
  factCheckStatus: {
    type: String,
    enum: ['unverified', 'true', 'false', 'misleading', 'partially_true'],
    default: 'unverified',
    index: true
  },
  factCheckDetails: {
    checkedAt: Date,
    verificationCount: Number,
    consensusPercentage: Number
  },
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  verifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verification'
  }],
  
  // Engagement
  commentCount: {
    type: Number,
    default: 0
  },
  repostCount: {
    type: Number,
    default: 0
  },
  bookmarkCount: {
    type: Number,
    default: 0
  },
  
  // Users who engaged
  repostedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Post relationships
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  quotedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  
  // Metadata
  hashtags: [String],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'followers', 'verified', 'private'],
    default: 'public'
  },
  
  // Token rewards distributed
  tokenRewards: {
    total: { type: Number, default: 0 },
    distributed: { type: Boolean, default: false }
  },
  
  // Status
  isDeleted: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ factCheckStatus: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ verificationCount: -1 });

// Extract hashtags and mentions before saving
postSchema.pre('save', function(next) {
  // Extract hashtags
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;
  while ((match = hashtagRegex.exec(this.content)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  this.hashtags = [...new Set(hashtags)];
  
  this.updatedAt = new Date();
  next();
});

const Post = mongoose.model('Post', postSchema);

// ============================================
// VERIFICATION MODEL
// ============================================

const verificationSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  verdict: {
    type: String,
    enum: ['true', 'false', 'misleading', 'partially_true'],
    required: true,
    index: true
  },
  sources: [{
    url: { type: String, required: true },
    title: String,
    domain: String,
    credibilityScore: Number
  }],
  explanation: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 1000
  },
  
  // Rewards
  tokenReward: {
    type: Number,
    default: 0
  },
  rewardClaimed: {
    type: Boolean,
    default: false
  },
  
  // Community voting
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Accuracy tracking
  isAccurate: {
    type: Boolean,
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index to prevent duplicate verifications
verificationSchema.index({ post: 1, user: 1 }, { unique: true });
verificationSchema.index({ user: 1, createdAt: -1 });

const Verification = mongoose.model('Verification', verificationSchema);

// ============================================
// NOTIFICATION MODEL
// ============================================

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'verification',
      'verified_your_post',
      'token_reward',
      'follow',
      'mention',
      'repost',
      'comment',
      'reply',
      'badge',
      'milestone',
      'system',
      'dm'
    ],
    required: true
  },
  
  // Source user (who triggered the notification)
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Related content
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  verification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verification'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  
  // Type-specific data
  data: {
    verdict: String,
    tokenAmount: Number,
    tokenReason: String,
    badgeType: String,
    milestoneType: String,
    milestoneValue: Number,
    systemMessage: String,
    note: String
  },
  
  // Status
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

// ============================================
// CONVERSATION MODEL
// ============================================

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Last message for preview
  lastMessage: {
    content: String,
    senderId: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['text', 'image', 'post_share', 'verification_share', 'gif'],
      default: 'text'
    },
    timestamp: Date
  },
  
  // Unread counts per participant
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  },
  
  // Settings per participant
  settings: {
    type: Map,
    of: {
      muted: { type: Boolean, default: false },
      pinned: { type: Boolean, default: false }
    },
    default: {}
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for finding conversations by participants
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

// ============================================
// MESSAGE MODEL
// ============================================

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'post_share', 'verification_share', 'gif'],
    default: 'text'
  },
  
  // Shared content
  sharedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  sharedVerification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verification'
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'gif']
    },
    url: String
  },
  
  // Read status
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Delivery status
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

// ============================================
// TRANSACTION MODEL
// ============================================

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'verification_reward',
      'post_reward',
      'referral_bonus',
      'daily_bonus',
      'streak_bonus',
      'milestone_bonus',
      'badge_bonus',
      'transfer_in',
      'transfer_out',
      'welcome_bonus',
      'leaderboard_reward',
      'tip_received',
      'tip_sent'
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Related entities
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  relatedVerification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verification'
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

// ============================================
// DAILY BONUS MODEL
// ============================================

const dailyBonusSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  claimedAt: {
    type: Date,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  streak: {
    type: Number,
    default: 1
  }
});

dailyBonusSchema.index({ user: 1, claimedAt: -1 });

const DailyBonus = mongoose.model('DailyBonus', dailyBonusSchema);

// ============================================
// REPORT MODEL
// ============================================

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['post', 'user', 'comment', 'message', 'verification'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'spam',
      'harassment',
      'hate_speech',
      'misinformation',
      'violence',
      'nudity',
      'self_harm',
      'impersonation',
      'copyright',
      'other'
    ]
  },
  details: {
    type: String,
    maxlength: 500
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date
});

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

// ============================================
// HASHTAG MODEL (for trending)
// ============================================

const hashtagSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  postCount: {
    type: Number,
    default: 0
  },
  // Rolling counts for trending
  counts: {
    hourly: { type: Number, default: 0 },
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 }
  },
  // Verification stats
  verificationRate: {
    type: Number,
    default: 0
  },
  verifiedPostCount: {
    type: Number,
    default: 0
  },
  
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

hashtagSchema.index({ 'counts.hourly': -1 });
hashtagSchema.index({ 'counts.daily': -1 });

const Hashtag = mongoose.model('Hashtag', hashtagSchema);

// ============================================
// EXPORT ALL MODELS
// ============================================

module.exports = {
  User,
  Post,
  Verification,
  Notification,
  Conversation,
  Message,
  Transaction,
  DailyBonus,
  Report,
  Hashtag
};