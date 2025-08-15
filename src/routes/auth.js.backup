// auth.js - Fixed Authentication Routes for Viurl
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, name } = req.body;

    // Validation
    if (!email || !password || !username || !name) {
      return res.status(400).json({ 
        message: 'Please provide email, password, username, and name' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      username,
      name,
      joinedDate: new Date(),
      trustScore: 100,
      vtokens: 100,
      isVerified: false,
      followers: 0,
      following: 0
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        trustScore: user.trustScore,
        vtokens: user.vtokens,
        isVerified: user.isVerified,
        joinedDate: user.joinedDate,
        followers: user.followers,
        following: user.following
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // Find user - use lean() to get plain object
    const user = await User.findOne({ email }).select("+password").lean();

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Fix missing name field for existing users
    if (!user.name && user.username) {
      // Update the user with a name field
      await User.findByIdAndUpdate(user._id, { 
        name: user.username 
      });
      user.name = user.username;
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password;

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        name: user.name || user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        location: user.location,
        website: user.website,
        trustScore: user.trustScore || 100,
        vtokens: user.vtokens || 0,
        isVerified: user.isVerified || false,
        joinedDate: user.joinedDate,
        followers: user.followers || 0,
        following: user.following || 0
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password').lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fix missing name field
    if (!user.name && user.username) {
      await User.findByIdAndUpdate(user._id, { 
        name: user.username 
      });
      user.name = user.username;
    }

    res.json({
      _id: user._id,
      email: user.email,
      username: user.username,
      name: user.name || user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      location: user.location,
      website: user.website,
      trustScore: user.trustScore || 100,
      vtokens: user.vtokens || 0,
      isVerified: user.isVerified || false,
      joinedDate: user.joinedDate,
      followers: user.followers || 0,
      following: user.following || 0
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ token });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error refreshing token' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  // Since we're using JWT, logout is handled client-side
  // This endpoint can be used for logging, blacklisting tokens, etc.
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;