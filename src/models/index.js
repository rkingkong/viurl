// models/index.js - VIURL Model Re-exports
// This file re-exports models from individual files
// and defines additional models that don't have their own files

const mongoose = require('mongoose');

// Import existing models from their files
const User = require('./User');
const Post = require('./Post');

// ============================================
// VERIFICATION MODEL
// ============================================

let Verification;
try {
  Verification = mongoose.model('Verification');
} catch {
  const verificationSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    verdict: { type: String, enum: ['true', 'false', 'misleading', 'partially_true'], required: true },
    sources: [{ url: String, title: String, domain: String, credibilityScore: Number }],
    explanation: { type: String, required: true, minlength: 20, maxlength: 1000 },
    tokenReward: { type: Number, default: 0 },
    rewardClaimed: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isAccurate: { type: Boolean, default: null },
    createdAt: { type: Date, default: Date.now, index: true }
  });
  verificationSchema.index({ post: 1, user: 1 }, { unique: true });
  Verification = mongoose.model('Verification', verificationSchema);
}

// ============================================
// NOTIFICATION MODEL
// ============================================

let Notification;
try {
  Notification = mongoose.model('Notification');
} catch {
  const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['verification', 'verified_your_post', 'token_reward', 'follow', 'mention', 'repost', 'comment', 'reply', 'badge', 'milestone', 'system', 'dm'], required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    verification: { type: mongoose.Schema.Types.ObjectId, ref: 'Verification' },
    data: { type: mongoose.Schema.Types.Mixed },
    read: { type: Boolean, default: false, index: true },
    readAt: Date,
    createdAt: { type: Date, default: Date.now, index: true }
  });
  notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
  Notification = mongoose.model('Notification', notificationSchema);
}

// ============================================
// CONVERSATION MODEL
// ============================================

let Conversation;
try {
  Conversation = mongoose.model('Conversation');
} catch {
  const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: {
      content: String,
      senderId: mongoose.Schema.Types.ObjectId,
      type: { type: String, enum: ['text', 'image', 'post_share', 'verification_share', 'gif'], default: 'text' },
      timestamp: Date
    },
    unreadCounts: { type: Map, of: Number, default: {} },
    settings: { type: Map, of: { muted: Boolean, pinned: Boolean }, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now, index: true }
  });
  conversationSchema.index({ participants: 1 });
  Conversation = mongoose.model('Conversation', conversationSchema);
}

// ============================================
// MESSAGE MODEL
// ============================================

let Message;
try {
  Message = mongoose.model('Message');
} catch {
  const messageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    type: { type: String, enum: ['text', 'image', 'post_share', 'verification_share', 'gif'], default: 'text' },
    sharedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    media: { type: { type: String }, url: String },
    read: { type: Boolean, default: false },
    readAt: Date,
    status: { type: String, enum: ['sending', 'sent', 'delivered', 'read', 'failed'], default: 'sent' },
    createdAt: { type: Date, default: Date.now, index: true }
  });
  messageSchema.index({ conversation: 1, createdAt: -1 });
  Message = mongoose.model('Message', messageSchema);
}

// ============================================
// TRANSACTION MODEL
// ============================================

let Transaction;
try {
  Transaction = mongoose.model('Transaction');
} catch {
  const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['verification_reward', 'post_reward', 'referral_bonus', 'daily_bonus', 'streak_bonus', 'milestone_bonus', 'badge_bonus', 'transfer_in', 'transfer_out', 'welcome_bonus', 'leaderboard_reward', 'tip_received', 'tip_sent'], required: true },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true },
    description: { type: String, required: true },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true }
  });
  transactionSchema.index({ user: 1, createdAt: -1 });
  Transaction = mongoose.model('Transaction', transactionSchema);
}

// ============================================
// DAILY BONUS MODEL
// ============================================

let DailyBonus;
try {
  DailyBonus = mongoose.model('DailyBonus');
} catch {
  const dailyBonusSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    claimedAt: { type: Date, required: true, index: true },
    amount: { type: Number, required: true },
    streak: { type: Number, default: 1 }
  });
  dailyBonusSchema.index({ user: 1, claimedAt: -1 });
  DailyBonus = mongoose.model('DailyBonus', dailyBonusSchema);
}

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
  DailyBonus
};
