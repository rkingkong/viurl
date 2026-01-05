const express = require('express');
const router = express.Router();
const { Post, User } = require('../models');

// Search posts and users
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, error: 'Query too short' });
    }

    const results = { posts: [], users: [], hashtags: [] };
    const regex = new RegExp(q, 'i');

    if (type === 'all' || type === 'posts') {
      results.posts = await Post.find({ content: regex })
        .populate('author', 'username name profilePicture trustScore')
        .sort({ createdAt: -1 })
        .limit(20);
    }

    if (type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [{ username: regex }, { name: regex }]
      })
        .select('username name profilePicture bio trustScore verificationBadge')
        .limit(10);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get trending topics
router.get('/trending', async (req, res) => {
  try {
    // Simple trending - most verified posts in last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const trending = await Post.aggregate([
      { $match: { createdAt: { $gte: yesterday } } },
      { $sort: { verificationCount: -1, likes: -1 } },
      { $limit: 10 },
      { $project: { content: 1, verificationCount: 1, likes: 1 } }
    ]);

    res.json({ success: true, data: trending });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
