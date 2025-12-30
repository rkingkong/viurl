// auth.js - VIURL Authentication Middleware
// Location: /var/www/viurl/src/middleware/auth.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Main authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    // Check for Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format. Use: Bearer <token>'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId || decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account has been deactivated'
      });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      if (user.suspendedUntil && new Date() < user.suspendedUntil) {
        return res.status(403).json({
          success: false,
          error: 'Account is suspended',
          suspendedUntil: user.suspendedUntil,
          reason: user.suspensionReason
        });
      } else {
        // Suspension expired, lift it
        user.isSuspended = false;
        user.suspendedUntil = null;
        user.suspensionReason = null;
        await user.save();
      }
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      trustScore: user.trustScore,
      verificationBadge: user.verificationBadge,
      vtokens: user.vtokens
    };

    // Attach full user object if needed
    req.fullUser = user;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Optional auth - doesn't fail if no token, but attaches user if present
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id);

    if (user && user.isActive) {
      req.user = {
        id: user._id,
        email: user.email,
        username: user.username,
        trustScore: user.trustScore,
        verificationBadge: user.verificationBadge,
        vtokens: user.vtokens
      };
      req.fullUser = user;
    }

    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
};

// Require verified user (bronze badge or higher)
const requireVerified = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.verificationBadge === 'none') {
    return res.status(403).json({
      success: false,
      error: 'Verified account required. Earn a verification badge to access this feature.'
    });
  }

  next();
};

// Require high trust score
const requireHighTrust = (minScore = 80) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (req.user.trustScore < minScore) {
      return res.status(403).json({
        success: false,
        error: `Trust score of ${minScore}% or higher required. Your current score: ${req.user.trustScore}%`
      });
    }

    next();
  };
};

// Admin check (for future admin features)
const requireAdmin = async (req, res, next) => {
  if (!req.fullUser || !req.fullUser.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

// Generate JWT token
const generateToken = (userId, expiresIn = '7d') => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn }
  );
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

module.exports = auth;
module.exports.optionalAuth = optionalAuth;
module.exports.requireVerified = requireVerified;
module.exports.requireHighTrust = requireHighTrust;
module.exports.requireAdmin = requireAdmin;
module.exports.generateToken = generateToken;
module.exports.generateRefreshToken = generateRefreshToken;
module.exports.verifyRefreshToken = verifyRefreshToken;