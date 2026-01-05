// verification.js - VIURL Verification API Routes
// Location: /var/www/viurl/src/routes/verification.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Import models
const { User, Post, Verification, Notification } = require('../models');

// ============================================
// VERIFICATION MODEL (if not exists)
// ============================================

// Define Verification Schema if not already defined
const verificationSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  verdict: {
    type: String,
    enum: ['true', 'false', 'misleading', 'partially_true'],
    required: true
  },
  sources: [{
    url: { type: String, required: true },
    title: String,
    domain: String,
    credibilityScore: Number
  }],
  explanation: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 1000
  },
  // Rewards
  tokenReward: {
    type: Number,
    default: 0
  },
  rewardClaimed: {
    type: Boolean,
    default: false
  },
  // Community voting on verification quality
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Status
  isAccurate: {
    type: Boolean,
    default: null // Determined after consensus
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for performance
verificationSchema.index({ post: 1, user: 1 }, { unique: true });
verificationSchema.index({ user: 1, createdAt: -1 });
verificationSchema.index({ verdict: 1 });

// Check if model exists before creating
let VerificationModel;
try {
  VerificationModel = mongoose.model('Verification');
} catch {
  VerificationModel = mongoose.model('Verification', verificationSchema);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate token reward based on verdict complexity and user trust score
const calculateTokenReward = (verdict, userTrustScore, sourcesCount) => {
  const baseRewards = {
    'true': 5,
    'false': 10,
    'misleading': 15,
    'partially_true': 12
  };

  let reward = baseRewards[verdict] || 5;

  // Bonus for high trust score users (more reliable verifiers)
  if (userTrustScore >= 90) {
    reward *= 1.5;
  } else if (userTrustScore >= 75) {
    reward *= 1.25;
  }

  // Bonus for providing multiple sources
  if (sourcesCount >= 3) {
    reward *= 1.3;
  } else if (sourcesCount >= 2) {
    reward *= 1.15;
  }

  return Math.round(reward);
};

// Update post's fact-check status based on verification consensus
const updatePostFactCheckStatus = async (postId) => {
  const verifications = await VerificationModel.find({ post: postId });
  
  if (verifications.length < 3) {
    // Not enough verifications for consensus
    return null;
  }

  // Weight votes by user trust score
  const weightedVotes = {
    'true': 0,
    'false': 0,
    'misleading': 0,
    'partially_true': 0
  };

  for (const v of verifications) {
    const user = await User.findById(v.user);
    const weight = user ? (user.trustScore / 100) : 0.5;
    weightedVotes[v.verdict] += weight;
  }

  // Find the winning verdict
  let maxVotes = 0;
  let winningVerdict = 'unverified';
  
  for (const [verdict, votes] of Object.entries(weightedVotes)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      winningVerdict = verdict;
    }
  }

  // Require at least 60% consensus
  const totalWeight = Object.values(weightedVotes).reduce((a, b) => a + b, 0);
  const consensusPercentage = (maxVotes / totalWeight) * 100;

  if (consensusPercentage >= 60) {
    await Post.findByIdAndUpdate(postId, {
      factCheckStatus: winningVerdict,
      'factCheckDetails.checkedAt': new Date(),
      'factCheckDetails.verificationCount': verifications.length
    });

    // Mark accurate verifications and update user trust scores
    for (const v of verifications) {
      const isAccurate = v.verdict === winningVerdict;
      await VerificationModel.findByIdAndUpdate(v._id, { isAccurate });
      
      // Update user trust score
      await updateUserTrustScore(v.user, isAccurate);
    }

    return winningVerdict;
  }

  return null;
};

// Update user's trust score based on verification accuracy
const updateUserTrustScore = async (userId, wasAccurate) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Get user's recent verifications (last 100)
  const recentVerifications = await VerificationModel.find({
    user: userId,
    isAccurate: { $ne: null }
  })
    .sort({ createdAt: -1 })
    .limit(100);

  if (recentVerifications.length < 5) {
    // Not enough data to calculate trust score
    return;
  }

  const accurateCount = recentVerifications.filter(v => v.isAccurate).length;
  const accuracyRate = (accurateCount / recentVerifications.length) * 100;

  // Calculate new trust score (weighted average with existing score)
  const newTrustScore = Math.round((user.trustScore * 0.3) + (accuracyRate * 0.7));
  
  // Update verification badge based on trust score and verification count
  let verificationBadge = 'none';
  const totalVerifications = await VerificationModel.countDocuments({ user: userId });

  if (newTrustScore >= 95 && totalVerifications >= 500) {
    verificationBadge = 'platinum';
  } else if (newTrustScore >= 90 && totalVerifications >= 200) {
    verificationBadge = 'gold';
  } else if (newTrustScore >= 80 && totalVerifications >= 50) {
    verificationBadge = 'silver';
  } else if (newTrustScore >= 70 && totalVerifications >= 10) {
    verificationBadge = 'bronze';
  }

  await User.findByIdAndUpdate(userId, {
    trustScore: Math.max(0, Math.min(100, newTrustScore)),
    verificationBadge
  });
};

// Extract domain from URL
const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
};

// ============================================
// ROUTES
// ============================================

// @route   POST /api/verifications
// @desc    Submit a verification for a post
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { postId, verdict, sources, explanation } = req.body;
    const userId = req.user.id;

    // Validation
    if (!postId || !verdict || !explanation) {
      return res.status(400).json({
        success: false,
        error: 'Post ID, verdict, and explanation are required'
      });
    }

    if (!['true', 'false', 'misleading', 'partially_true'].includes(verdict)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verdict. Must be: true, false, misleading, or partially_true'
      });
    }

    if (explanation.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Explanation must be at least 20 characters'
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user has already verified this post
    const existingVerification = await VerificationModel.findOne({
      post: postId,
      user: userId
    });

    if (existingVerification) {
      return res.status(400).json({
        success: false,
        error: 'You have already verified this post'
      });
    }

    // Prevent users from verifying their own posts
    if (post.author.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot verify your own post'
      });
    }

    // Get user for trust score
    const user = await User.findById(userId);

    // Process sources
    const processedSources = (sources || []).map(url => ({
      url,
      domain: extractDomain(url),
      title: null, // Could be fetched via web scraping
      credibilityScore: null
    }));

    // Calculate token reward
    const tokenReward = calculateTokenReward(verdict, user.trustScore, processedSources.length);

    // Create verification
    const verification = new VerificationModel({
      post: postId,
      user: userId,
      verdict,
      sources: processedSources,
      explanation,
      tokenReward
    });

    await verification.save();

    // Update post verification count
    await Post.findByIdAndUpdate(postId, {
      $inc: { verificationCount: 1 },
      $push: { verifications: verification._id }
    });

    // Award tokens to user
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        vtokens: tokenReward,
        verificationsCount: 1
      },
      $push: { verifiedPosts: postId }
    });

    // Create notification for post author
    if (post.author.toString() !== userId) {
      const notification = new Notification({
        recipient: post.author,
        type: 'verified_your_post',
        fromUser: userId,
        post: postId,
        verification: verification._id,
        data: {
          verdict,
          tokenReward
        }
      });
      await notification.save();
    }

    // Check if we have enough verifications for consensus
    await updatePostFactCheckStatus(postId);

    // Populate and return
    const populatedVerification = await VerificationModel.findById(verification._id)
      .populate('user', 'username name profilePicture trustScore verificationBadge')
      .populate('post', 'content author');

    res.status(201).json({
      success: true,
      data: {
        verification: populatedVerification,
        tokenReward,
        message: `Verification submitted! You earned ${tokenReward} V-TKN`
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while submitting verification'
    });
  }
});

// @route   GET /api/verifications/post/:postId
// @desc    Get all verifications for a post
// @access  Public
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { cursor, limit = 20 } = req.query;

    const query = { post: postId };
    
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const verifications = await VerificationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate('user', 'username name profilePicture trustScore verificationBadge');

    const hasMore = verifications.length > limit;
    if (hasMore) verifications.pop();

    // Get verdict summary
    const verdictCounts = await VerificationModel.aggregate([
      { $match: { post: new mongoose.Types.ObjectId(postId) } },
      { $group: { _id: '$verdict', count: { $sum: 1 } } }
    ]);

    const summary = {
      total: verdictCounts.reduce((acc, v) => acc + v.count, 0),
      verdicts: verdictCounts.reduce((acc, v) => {
        acc[v._id] = v.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        items: verifications,
        summary,
        hasMore,
        cursor: hasMore ? verifications[verifications.length - 1].createdAt : null
      }
    });

  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching verifications'
    });
  }
});

// @route   GET /api/verifications/me
// @desc    Get current user's verifications
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cursor, limit = 20 } = req.query;

    const query = { user: userId };
    
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const verifications = await VerificationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate('post', 'content author factCheckStatus')
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'username name profilePicture'
        }
      });

    const hasMore = verifications.length > limit;
    if (hasMore) verifications.pop();

    res.json({
      success: true,
      data: {
        items: verifications,
        hasMore,
        cursor: hasMore ? verifications[verifications.length - 1].createdAt : null
      }
    });

  } catch (error) {
    console.error('Get my verifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching verifications'
    });
  }
});

// @route   GET /api/verifications/user/:username
// @desc    Get verifications by a specific user
// @access  Public
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { cursor, limit = 20 } = req.query;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const query = { user: user._id };
    
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const verifications = await VerificationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate('post', 'content author factCheckStatus');

    const hasMore = verifications.length > limit;
    if (hasMore) verifications.pop();

    res.json({
      success: true,
      data: {
        items: verifications,
        hasMore,
        cursor: hasMore ? verifications[verifications.length - 1].createdAt : null
      }
    });

  } catch (error) {
    console.error('Get user verifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching verifications'
    });
  }
});

// @route   GET /api/verifications/stats
// @desc    Get current user's verification statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Total verifications
    const totalVerifications = await VerificationModel.countDocuments({ user: userId });

    // Verifications with known accuracy
    const accurateVerifications = await VerificationModel.countDocuments({
      user: userId,
      isAccurate: true
    });

    const inaccurateVerifications = await VerificationModel.countDocuments({
      user: userId,
      isAccurate: false
    });

    const ratedVerifications = accurateVerifications + inaccurateVerifications;
    const accuracyRate = ratedVerifications > 0 
      ? Math.round((accurateVerifications / ratedVerifications) * 100) 
      : 0;

    // Total tokens earned from verifications
    const tokensResult = await VerificationModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$tokenReward' } } }
    ]);
    const tokensEarned = tokensResult[0]?.total || 0;

    // Verdict breakdown
    const verdictBreakdown = await VerificationModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$verdict', count: { $sum: 1 } } }
    ]);

    const verdicts = verdictBreakdown.reduce((acc, v) => {
      acc[v._id] = v.count;
      return acc;
    }, { true: 0, false: 0, misleading: 0, partially_true: 0 });

    // Calculate rank (by verification count)
    const rank = await User.countDocuments({
      verificationsCount: { $gt: totalVerifications }
    }) + 1;

    // Percentile
    const totalUsers = await User.countDocuments({ verificationsCount: { $gt: 0 } });
    const percentile = totalUsers > 0 
      ? Math.round(((totalUsers - rank) / totalUsers) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        totalVerifications,
        accuracyRate,
        tokensEarned,
        verdictBreakdown: verdicts,
        rank,
        percentile,
        accurateVerifications,
        ratedVerifications
      }
    });

  } catch (error) {
    console.error('Get verification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching stats'
    });
  }
});

// @route   POST /api/verifications/:id/upvote
// @desc    Upvote a verification (agree it's helpful/accurate)
// @access  Private
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const verificationId = req.params.id;
    const userId = req.user.id;

    const verification = await VerificationModel.findById(verificationId);
    if (!verification) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found'
      });
    }

    // Check if user already voted
    const hasUpvoted = verification.upvotedBy.includes(userId);
    const hasDownvoted = verification.downvotedBy.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      await VerificationModel.findByIdAndUpdate(verificationId, {
        $pull: { upvotedBy: userId },
        $inc: { upvotes: -1 }
      });
    } else {
      // Add upvote, remove downvote if exists
      const update = {
        $push: { upvotedBy: userId },
        $inc: { upvotes: 1 }
      };

      if (hasDownvoted) {
        update.$pull = { downvotedBy: userId };
        update.$inc.downvotes = -1;
      }

      await VerificationModel.findByIdAndUpdate(verificationId, update);
    }

    const updated = await VerificationModel.findById(verificationId);

    res.json({
      success: true,
      data: {
        upvotes: updated.upvotes,
        downvotes: updated.downvotes,
        isUpvoted: !hasUpvoted,
        isDownvoted: false
      }
    });

  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while upvoting'
    });
  }
});

// @route   POST /api/verifications/:id/downvote
// @desc    Downvote a verification (disagree)
// @access  Private
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const verificationId = req.params.id;
    const userId = req.user.id;

    const verification = await VerificationModel.findById(verificationId);
    if (!verification) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found'
      });
    }

    // Check if user already voted
    const hasUpvoted = verification.upvotedBy.includes(userId);
    const hasDownvoted = verification.downvotedBy.includes(userId);

    if (hasDownvoted) {
      // Remove downvote
      await VerificationModel.findByIdAndUpdate(verificationId, {
        $pull: { downvotedBy: userId },
        $inc: { downvotes: -1 }
      });
    } else {
      // Add downvote, remove upvote if exists
      const update = {
        $push: { downvotedBy: userId },
        $inc: { downvotes: 1 }
      };

      if (hasUpvoted) {
        update.$pull = { upvotedBy: userId };
        update.$inc.upvotes = -1;
      }

      await VerificationModel.findByIdAndUpdate(verificationId, update);
    }

    const updated = await VerificationModel.findById(verificationId);

    res.json({
      success: true,
      data: {
        upvotes: updated.upvotes,
        downvotes: updated.downvotes,
        isUpvoted: false,
        isDownvoted: !hasDownvoted
      }
    });

  } catch (error) {
    console.error('Downvote error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while downvoting'
    });
  }
});

// @route   GET /api/verifications/content
// @desc    Get posts by fact-check status
// @access  Public
router.get('/content', async (req, res) => {
  try {
    const { status, cursor, limit = 20 } = req.query;

    if (!['true', 'false', 'misleading', 'partially_true'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: true, false, misleading, or partially_true'
      });
    }

    const query = { factCheckStatus: status };
    
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate('author', 'username name profilePicture trustScore verificationBadge');

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    res.json({
      success: true,
      data: {
        items: posts,
        hasMore,
        cursor: hasMore ? posts[posts.length - 1].createdAt : null
      }
    });

  } catch (error) {
    console.error('Get verified content error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching content'
    });
  }
});

// @route   GET /api/verifications/leaderboard
// @desc    Get top verifiers
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'weekly', limit = 100 } = req.query;

    // Calculate date range
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'allTime':
      default:
        startDate = new Date(0);
    }

    const leaderboard = await VerificationModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$user',
          verificationCount: { $sum: 1 },
          tokensEarned: { $sum: '$tokenReward' },
          accurateCount: {
            $sum: { $cond: [{ $eq: ['$isAccurate', true] }, 1, 0] }
          }
        }
      },
      { $sort: { verificationCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: {
            id: '$user._id',
            username: '$user.username',
            name: '$user.name',
            profilePicture: '$user.profilePicture',
            trustScore: '$user.trustScore',
            verificationBadge: '$user.verificationBadge'
          },
          verificationCount: 1,
          tokensEarned: 1,
          accuracyRate: {
            $cond: [
              { $gt: ['$verificationCount', 0] },
              { $multiply: [{ $divide: ['$accurateCount', '$verificationCount'] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    res.json({
      success: true,
      data: {
        period,
        entries: rankedLeaderboard,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching leaderboard'
    });
  }
});

// @route   GET /api/verifications/:id
// @desc    Get a single verification by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const verification = await VerificationModel.findById(req.params.id)
      .populate('user', 'username name profilePicture trustScore verificationBadge')
      .populate({
        path: 'post',
        select: 'content author factCheckStatus createdAt',
        populate: {
          path: 'author',
          select: 'username name profilePicture'
        }
      });

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found'
      });
    }

    res.json({
      success: true,
      data: verification
    });

  } catch (error) {
    console.error('Get verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching verification'
    });
  }
});

module.exports = router;