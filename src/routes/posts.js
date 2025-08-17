// posts.js - Posts Routes for Viurl
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { content, media } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    if (content.length > 280) {
      return res.status(400).json({ message: 'Post content must be 280 characters or less' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newPost = new Post({
      author: req.userId,
      content: content.trim(),
      media: media || [],
      verifications: [],
      verificationCount: 0,
      comments: [],
      reposts: 0,
      bookmarks: 0,
      trustScore: user.trustScore
    });

    await newPost.save();
    
    // Add post to user's posts array
    user.posts.push(newPost._id);
    await user.save();

    // Populate author info
    await newPost.populate('author', 'name username profilePicture trustScore isVerified');

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// @route   GET /api/posts
// @desc    Get all posts (with pagination)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isDeleted: false })
      .populate('author', 'name username profilePicture trustScore isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ isDeleted: false });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username profilePicture trustScore isVerified')
      .populate('comments.author', 'name username profilePicture');

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error fetching post' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.isDeleted = true;
    await post.save();

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

// @route   POST /api/posts/:id/verify
// @desc    Verify a post (like)
// @access  Private
router.post('/:id/verify', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already verified
    const alreadyVerified = post.verifications.some(
      v => v.toString() === req.userId
    );

    if (alreadyVerified) {
      return res.status(400).json({ message: 'Post already verified' });
    }

    // Add verification
    post.verifications.push(req.userId);
    post.verificationCount = post.verifications.length;
    
    // Award tokens to post author
    const author = await User.findById(post.author);
    if (author) {
      author.addTokens(1, 'Post verified');
      await author.save();
    }

    // Award tokens to verifier
    const verifier = await User.findById(req.userId);
    if (verifier) {
      verifier.addTokens(0.5, 'Verified content');
      verifier.stats.totalVerifications += 1;
      await verifier.save();
    }

    await post.save();

    res.json({ 
      message: 'Post verified successfully',
      verificationCount: post.verificationCount
    });

  } catch (error) {
    console.error('Verify post error:', error);
    res.status(500).json({ message: 'Server error verifying post' });
  }
});

// @route   DELETE /api/posts/:id/verify
// @desc    Unverify a post
// @access  Private
router.delete('/:id/verify', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove verification
    post.verifications = post.verifications.filter(
      v => v.toString() !== req.userId
    );
    post.verificationCount = post.verifications.length;

    await post.save();

    res.json({ 
      message: 'Verification removed',
      verificationCount: post.verificationCount
    });

  } catch (error) {
    console.error('Unverify post error:', error);
    res.status(500).json({ message: 'Server error removing verification' });
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      author: req.userId,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment's author
    await post.populate('comments.author', 'name username profilePicture');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

module.exports = router;
