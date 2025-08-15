const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Traditional auth
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    select: false
  },
  
  // Web3 auth
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  
  // Profile
  displayName: String,
  avatar: String,
  bio: String,
  
  // Viurl specific
  reputation: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tokens: {
    VTOKENS: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  
  // Verification
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  
  // Security
  twoFactorSecret: String,
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: Date
  }],
  
  // Stats
  postsCount: { type: Number, default: 0 },
  verificationsCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
