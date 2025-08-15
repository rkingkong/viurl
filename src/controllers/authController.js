const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

class AuthController {
  // User Registration
  async register(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, username, walletAddress } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User with this email or username already exists' 
        });
      }

      // Create user - NO HASHING HERE, let the model handle it
      const user = new User({
        email,
        username,
        password: password,  // ✅ CORRECT - Plain password, model will hash it
        walletAddress,
        reputation: 0,
        tokens: 0,
        isVerified: false,
        createdAt: new Date()
      });

      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          walletAddress: user.walletAddress
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Registration failed', 
        details: error.message 
      });
    }
  }

  // User Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select('+password');
      console.log('User found:', user ? 'Yes' : 'No');
      console.log('Password field:', user ? (user.password ? 'Present' : 'Missing') : 'N/A');
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // Verify password using the model's method
      const isValidPassword = await user.comparePassword(password);
      console.log('Password valid:', isValidPassword);

      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          reputation: user.reputation,
          tokens: user.tokens
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Login failed', 
        details: error.message 
      });
    }
  }

  // Web3 Wallet Login
  async web3Login(req, res) {
    try {
      const { walletAddress, signature, message } = req.body;

      // Verify signature (implement actual Web3 verification)
      // This is a placeholder - implement actual signature verification
      const isValidSignature = this.verifyWeb3Signature(walletAddress, signature, message);
      
      if (!isValidSignature) {
        return res.status(401).json({ 
          error: 'Invalid signature' 
        });
      }

      // Find or create user
      let user = await User.findOne({ walletAddress });
      
      if (!user) {
        // Create new user with wallet
        user = new User({
          walletAddress,
          username: `user_${walletAddress.substring(0, 8)}`,
          reputation: 0,
          tokens: 0,
          isWeb3User: true,
          createdAt: new Date()
        });
        await user.save();
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Save refresh token
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Web3 login successful',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          reputation: user.reputation,
          tokens: user.tokens
        }
      });
    } catch (error) {
      console.error('Web3 login error:', error);
      res.status(500).json({ 
        error: 'Web3 login failed', 
        details: error.message 
      });
    }
  }

  // Get User Profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId).select('-password -refreshToken');
      
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch profile', 
        details: error.message 
      });
    }
  }

  // Update Profile
  async updateProfile(req, res) {
    try {
      const { username, email, bio, avatar } = req.body;
      
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      // Update fields
      if (username) user.username = username;
      if (email) user.email = email;
      if (bio) user.bio = bio;
      if (avatar) user.avatar = avatar;

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        error: 'Failed to update profile', 
        details: error.message 
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        error: 'Logout failed', 
        details: error.message 
      });
    }
  }

  // Refresh Token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ 
          error: 'Refresh token required' 
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
      
      // Find user
      const user = await User.findById(decoded.userId).select('+refreshToken');
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ 
          error: 'Invalid refresh token' 
        });
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      res.json({
        success: true,
        accessToken
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ 
        error: 'Invalid refresh token', 
        details: error.message 
      });
    }
  }

  // Helper: Generate Access Token
  generateAccessToken(user) {
    return jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
  }

  // Helper: Generate Refresh Token
  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      { expiresIn: '7d' }
    );
  }

  // Helper: Verify Web3 Signature (placeholder)
  verifyWeb3Signature(address, signature, message) {
    // TODO: Implement actual Web3 signature verification
    // Using ethers.js or web3.js
    return true; // Placeholder
  }
}

const controller = new AuthController();

// Bind all methods to maintain 'this' context
module.exports = {
  register: controller.register.bind(controller),
  login: controller.login.bind(controller),
  web3Login: controller.web3Login.bind(controller),
  getProfile: controller.getProfile.bind(controller),
  updateProfile: controller.updateProfile.bind(controller),
  logout: controller.logout.bind(controller),
  refreshToken: controller.refreshToken.bind(controller)
};