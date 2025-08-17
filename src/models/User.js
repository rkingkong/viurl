// User.js - MongoDB User Model for Viurl
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't return password by default
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 280,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  vtokens: {
    type: Number,
    default: 100 // Starting bonus
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationBadge: {
    type: String,
    enum: ['none', 'bronze', 'silver', 'gold', 'platinum'],
    default: 'none'
  },
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  followersList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followingList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  verifiedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['follow', 'verify', 'mention', 'reply', 'token_received']
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    message: String,
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  joinedDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
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
    }
  },
  stats: {
    totalVerifications: {
      type: Number,
      default: 0
    },
    accurateVerifications: {
      type: Number,
      default: 0
    },
    tokensEarned: {
      type: Number,
      default: 100
    },
    tokensSpent: {
      type: Number,
      default: 0
    }
  },
  walletAddress: {
    type: String,
    default: ''
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ trustScore: -1 });
userSchema.index({ joinedDate: -1 });

// Virtual for profile completeness
userSchema.virtual('profileCompleteness').get(function() {
  let score = 0;
  if (this.profilePicture) score += 20;
  if (this.bio) score += 20;
  if (this.location) score += 20;
  if (this.website) score += 20;
  if (this.walletAddress) score += 20;
  return score;
});

// Method to calculate trust score
userSchema.methods.calculateTrustScore = function() {
  const verificationAccuracy = this.stats.totalVerifications > 0 
    ? (this.stats.accurateVerifications / this.stats.totalVerifications) * 100 
    : 0;
  
  const activityScore = Math.min(this.stats.totalVerifications / 100 * 20, 20);
  const followerScore = Math.min(this.followers / 1000 * 10, 10);
  
  this.trustScore = Math.min(verificationAccuracy * 0.7 + activityScore + followerScore, 100);
  
  // Update verification badge
  if (this.trustScore >= 90) this.verificationBadge = 'platinum';
  else if (this.trustScore >= 75) this.verificationBadge = 'gold';
  else if (this.trustScore >= 50) this.verificationBadge = 'silver';
  else if (this.trustScore >= 25) this.verificationBadge = 'bronze';
  else this.verificationBadge = 'none';
  
  return this.trustScore;
};

// Method to add tokens
userSchema.methods.addTokens = function(amount, reason) {
  this.vtokens += amount;
  this.stats.tokensEarned += amount;
  return this.vtokens;
};

// Method to spend tokens
userSchema.methods.spendTokens = function(amount) {
  if (this.vtokens < amount) {
    throw new Error('Insufficient tokens');
  }
  this.vtokens -= amount;
  this.stats.tokensSpent += amount;
  return this.vtokens;
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.twoFactorSecret;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
