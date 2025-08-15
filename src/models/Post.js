// Post.js - MongoDB Post Model for Viurl
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 280
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'gif'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: String,
    alt: String
  }],
  verifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  verificationCount: {
    type: Number,
    default: 0
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 280
    },
    verifications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reposts: {
    type: Number,
    default: 0
  },
  repostedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarks: {
    type: Number,
    default: 0
  },
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  hashtags: [{
    type: String,
    lowercase: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  trustScore: {
    type: Number,
    default: 0
  },
  factCheckStatus: {
    type: String,
    enum: ['unverified', 'true', 'partially_true', 'false', 'misleading'],
    default: 'unverified'
  },
  factCheckDetails: {
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedAt: Date,
    sources: [String],
    explanation: String
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  reportCount: {
    type: Number,
    default: 0
  },
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'misinformation', 'inappropriate', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    }
  },
  thread: {
    isThread: {
      type: Boolean,
      default: false
    },
    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    threadPosts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }]
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  tokenRewards: {
    total: {
      type: Number,
      default: 0
    },
    distributions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      amount: Number,
      reason: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ verificationCount: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ mentions: 1 });
postSchema.index({ isDeleted: 1 });

// Virtual for engagement score
postSchema.virtual('engagementScore').get(function() {
  return (
    this.verificationCount * 3 +
    this.comments.length * 2 +
    this.reposts * 2 +
    this.bookmarks +
    this.engagement.views * 0.1 +
    this.engagement.shares * 2
  );
});

// Method to extract hashtags from content
postSchema.methods.extractHashtags = function() {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const hashtags = this.content.match(hashtagRegex);
  if (hashtags) {
    this.hashtags = hashtags.map(tag => tag.substring(1).toLowerCase());
  }
};

// Method to extract mentions from content
postSchema.methods.extractMentions = async function() {
  const mentionRegex = /@[a-zA-Z0-9_]+/g;
  const mentions = this.content.match(mentionRegex);
  if (mentions) {
    const User = mongoose.model('User');
    const mentionedUsers = [];
    for (const mention of mentions) {
      const username = mention.substring(1).toLowerCase();
      const user = await User.findOne({ username });
      if (user) {
        mentionedUsers.push(user._id);
      }
    }
    this.mentions = mentionedUsers;
  }
};

// Pre-save middleware
postSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('content')) {
    this.extractHashtags();
    await this.extractMentions();
  }
  next();
});

// Method to check if user has verified
postSchema.methods.hasVerified = function(userId) {
  return this.verifications.some(v => v.toString() === userId.toString());
};

// Method to check if user has bookmarked
postSchema.methods.hasBookmarked = function(userId) {
  return this.bookmarkedBy.some(b => b.toString() === userId.toString());
};

// Remove sensitive data when converting to JSON
postSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.isDeleted) {
    return {
      _id: obj._id,
      isDeleted: true,
      message: 'This post has been deleted'
    };
  }
  delete obj.__v;
  delete obj.reports; // Don't expose report details
  return obj;
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
