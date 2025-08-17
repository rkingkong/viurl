// users.js - Users Routes for Viurl
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -settings -notifications');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, location, website, profilePicture, bannerImage } = req.body;

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio.substring(0, 280);
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (bannerImage !== undefined) user.bannerImage = bannerImage;

    await user.save();

    res.json({ 
      message: 'Profile updated successfully',
      user 
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (currentUser.followingList.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Update following list
    currentUser.followingList.push(req.params.id);
    currentUser.following = currentUser.followingList.length;

    // Update followers list
    userToFollow.followersList.push(req.userId);
    userToFollow.followers = userToFollow.followersList.length;

    // Award tokens for building network
    currentUser.addTokens(0.1, 'Following user');
    userToFollow.addTokens(0.2, 'New follower');

    await currentUser.save();
    await userToFollow.save();

    // Create notification
    userToFollow.notifications.push({
      type: 'follow',
      from: req.userId,
      message: `${currentUser.username} started following you`
    });
    await userToFollow.save();

    res.json({ 
      message: 'Successfully followed user',
      following: currentUser.following,
      followers: userToFollow.followers
    });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error following user' });
  }
});

// @route   DELETE /api/users/:id/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:id/follow', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from following list
    currentUser.followingList = currentUser.followingList.filter(
      id => id.toString() !== req.params.id
    );
    currentUser.following = currentUser.followingList.length;

    // Remove from followers list
    userToUnfollow.followersList = userToUnfollow.followersList.filter(
      id => id.toString() !== req.userId
    );
    userToUnfollow.followers = userToUnfollow.followersList.length;

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ 
      message: 'Successfully unfollowed user',
      following: currentUser.following,
      followers: userToUnfollow.followers
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error unfollowing user' });
  }
});

// @route   GET /api/users/:id/posts
// @desc    Get user's posts
// @access  Public
router.get('/:id/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ 
      author: req.params.id,
      isDeleted: false 
    })
      .populate('author', 'name username profilePicture trustScore isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ 
      author: req.params.id,
      isDeleted: false 
    });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error fetching user posts' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ]
    })
      .select('name username profilePicture trustScore isVerified bio')
      .limit(20);

    res.json(users);

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followersList', 'name username profilePicture trustScore isVerified');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followersList);

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error fetching followers' });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get users that user is following
// @access  Public
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followingList', 'name username profilePicture trustScore isVerified');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followingList);

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error fetching following' });
  }
});

module.exports = router;
