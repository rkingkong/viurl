// tokens.js - VIURL Token Economy API Routes
// Location: /var/www/viurl/src/routes/tokens.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Import models
const { User, Transaction, DailyBonus } = require('../models');

// ROUTES
// ============================================

// @route   GET /api/tokens/balance
// @desc    Get current user's token balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate pending (from unprocessed verifications)
    const pendingBalance = 0; // Could calculate from pending verifications

    // Calculate total earned
    const totalEarnedResult = await Transaction.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          amount: { $gt: 0 }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalEarned = totalEarnedResult[0]?.total || 0;

    // Calculate total spent/sent
    const totalSpentResult = await Transaction.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          amount: { $lt: 0 }
        } 
      },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
    ]);
    const totalSpent = totalSpentResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        balance: user.vtokens,
        pendingBalance,
        totalEarned,
        totalSpent,
        // Estimated USD value (example rate)
        estimatedUsd: (user.vtokens * 0.05).toFixed(2)
      }
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching balance'
    });
  }
});

// @route   GET /api/tokens/transactions
// @desc    Get transaction history
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const { cursor, limit = 20, type } = req.query;
    const userId = req.user.id;

    const query = { user: userId };
    
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate('relatedUser', 'username name profilePicture');

    const hasMore = transactions.length > limit;
    if (hasMore) transactions.pop();

    res.json({
      success: true,
      data: {
        items: transactions,
        hasMore,
        cursor: hasMore ? transactions[transactions.length - 1].createdAt : null
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching transactions'
    });
  }
});

// @route   POST /api/tokens/transfer
// @desc    Transfer tokens to another user
// @access  Private
router.post('/transfer', auth, async (req, res) => {
  try {
    const { recipientUsername, amount, note } = req.body;
    const senderId = req.user.id;

    // Validation
    if (!recipientUsername || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Recipient username and amount are required'
      });
    }

    const transferAmount = parseInt(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      });
    }

    if (transferAmount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Minimum transfer amount is 1 V-TKN'
      });
    }

    // Get sender
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        error: 'Sender not found'
      });
    }

    // Check balance
    if (sender.vtokens < transferAmount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Get recipient
    const recipient = await User.findOne({ 
      username: recipientUsername.toLowerCase().replace('@', '') 
    });
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }

    // Can't send to yourself
    if (sender._id.equals(recipient._id)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot transfer to yourself'
      });
    }

    // Create sender transaction (negative amount)
    const senderDescription = `Sent to @${recipient.username}${note ? `: ${note}` : ''}`;
    const { transaction: senderTx, newBalance: senderBalance } = await createTransaction(
      senderId,
      'transfer_out',
      -transferAmount,
      senderDescription,
      { relatedUser: recipient._id, metadata: { note } }
    );

    // Create recipient transaction (positive amount)
    const recipientDescription = `Received from @${sender.username}${note ? `: ${note}` : ''}`;
    await createTransaction(
      recipient._id,
      'transfer_in',
      transferAmount,
      recipientDescription,
      { relatedUser: sender._id, metadata: { note } }
    );

    // Create notification for recipient
    const Notification = mongoose.model('Notification');
    const notification = new Notification({
      recipient: recipient._id,
      type: 'token_reward',
      fromUser: sender._id,
      data: {
        amount: transferAmount,
        reason: `Transfer from @${sender.username}`,
        note
      }
    });
    await notification.save();

    res.json({
      success: true,
      data: {
        transaction: senderTx,
        newBalance: senderBalance,
        message: `Successfully sent ${transferAmount} V-TKN to @${recipient.username}`
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing transfer'
    });
  }
});

// @route   POST /api/tokens/claim-daily
// @desc    Claim daily login bonus
// @access  Private
router.post('/claim-daily', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Check if already claimed today
    const todaysClaim = await DailyBonus.findOne({
      user: userId,
      claimedAt: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      }
    });

    if (todaysClaim) {
      return res.status(400).json({
        success: false,
        error: 'Daily bonus already claimed today',
        data: {
          nextClaimAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          currentStreak: todaysClaim.streak
        }
      });
    }

    // Get last claim to calculate streak
    const lastClaim = await DailyBonus.findOne({ user: userId })
      .sort({ claimedAt: -1 });

    let streak = 1;
    if (lastClaim) {
      if (isConsecutiveDay(lastClaim.claimedAt, now)) {
        streak = lastClaim.streak + 1;
      }
      // If more than 1 day gap, streak resets to 1
    }

    // Calculate bonus amount
    const bonusAmount = calculateDailyBonus(streak);

    // Create daily bonus record
    const dailyBonus = new DailyBonus({
      user: userId,
      claimedAt: now,
      amount: bonusAmount,
      streak
    });
    await dailyBonus.save();

    // Create transaction
    const description = streak > 1 
      ? `Daily bonus (${streak}-day streak! 🔥)` 
      : 'Daily login bonus';
    
    const { transaction, newBalance } = await createTransaction(
      userId,
      streak > 1 ? 'streak_bonus' : 'daily_bonus',
      bonusAmount,
      description,
      { metadata: { streak, day: now.toISOString().split('T')[0] } }
    );

    // Check for streak milestones
    let streakMilestoneBonus = 0;
    let streakMilestone = null;

    const streakMilestones = [
      { days: 7, reward: 10, name: '7-day streak' },
      { days: 14, reward: 25, name: '14-day streak' },
      { days: 30, reward: 50, name: '30-day streak' },
      { days: 100, reward: 200, name: '100-day streak' }
    ];

    for (const milestone of streakMilestones) {
      if (streak === milestone.days) {
        streakMilestoneBonus = milestone.reward;
        streakMilestone = milestone.name;
        
        await createTransaction(
          userId,
          'milestone_bonus',
          milestone.reward,
          `🎉 ${milestone.name} milestone bonus!`,
          { metadata: { milestone: `streak_${milestone.days}` } }
        );
        break;
      }
    }

    res.json({
      success: true,
      data: {
        amount: bonusAmount,
        streak,
        newBalance: newBalance + streakMilestoneBonus,
        nextClaimAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        streakMilestone,
        streakMilestoneBonus,
        message: streak > 1 
          ? `🔥 ${streak}-day streak! You earned ${bonusAmount} V-TKN` 
          : `You earned ${bonusAmount} V-TKN`
      }
    });

  } catch (error) {
    console.error('Claim daily error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while claiming daily bonus'
    });
  }
});

// @route   GET /api/tokens/daily-status
// @desc    Check daily bonus status
// @access  Private
router.get('/daily-status', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Check today's claim
    const todaysClaim = await DailyBonus.findOne({
      user: userId,
      claimedAt: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      }
    });

    // Get current streak
    const lastClaim = await DailyBonus.findOne({ user: userId })
      .sort({ claimedAt: -1 });

    let currentStreak = 0;
    let canClaim = true;

    if (todaysClaim) {
      currentStreak = todaysClaim.streak;
      canClaim = false;
    } else if (lastClaim) {
      if (isConsecutiveDay(lastClaim.claimedAt, now)) {
        currentStreak = lastClaim.streak; // Will be incremented on claim
      }
      // If gap > 1 day, streak will reset
    }

    const nextBonus = calculateDailyBonus(currentStreak + (canClaim ? 1 : 0));

    res.json({
      success: true,
      data: {
        canClaim,
        currentStreak,
        nextBonus,
        claimedToday: !canClaim,
        nextClaimAt: canClaim ? null : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      }
    });

  } catch (error) {
    console.error('Daily status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking daily status'
    });
  }
});

// @route   GET /api/tokens/earnings
// @desc    Get earnings breakdown
// @access  Private
router.get('/earnings', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'allTime' } = req.query;

    // Calculate date range
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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

    const matchStage = {
      user: new mongoose.Types.ObjectId(userId),
      amount: { $gt: 0 },
      createdAt: { $gte: startDate }
    };

    const earnings = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format response
    const breakdown = {
      verifications: 0,
      posts: 0,
      referrals: 0,
      dailyBonuses: 0,
      milestones: 0,
      transfers: 0,
      other: 0
    };

    let total = 0;

    for (const earning of earnings) {
      total += earning.total;
      
      switch (earning._id) {
        case 'verification_reward':
          breakdown.verifications = earning.total;
          break;
        case 'post_reward':
          breakdown.posts = earning.total;
          break;
        case 'referral_bonus':
          breakdown.referrals = earning.total;
          break;
        case 'daily_bonus':
        case 'streak_bonus':
          breakdown.dailyBonuses += earning.total;
          break;
        case 'milestone_bonus':
        case 'badge_bonus':
          breakdown.milestones += earning.total;
          break;
        case 'transfer_in':
        case 'tip_received':
          breakdown.transfers += earning.total;
          break;
        default:
          breakdown.other += earning.total;
      }
    }

    res.json({
      success: true,
      data: {
        period,
        total,
        breakdown,
        topSource: Object.entries(breakdown)
          .filter(([_, value]) => value > 0)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || null
      }
    });

  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching earnings'
    });
  }
});

// @route   GET /api/tokens/milestones
// @desc    Get available milestone bonuses
// @access  Private
router.get('/milestones', auth, async (req, res) => {
  try {
    const availableMilestones = await checkMilestones(req.user.id);

    res.json({
      success: true,
      data: {
        available: availableMilestones,
        totalReward: availableMilestones.reduce((sum, m) => sum + m.reward, 0)
      }
    });

  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching milestones'
    });
  }
});

// @route   POST /api/tokens/claim-milestone
// @desc    Claim a milestone bonus
// @access  Private
router.post('/claim-milestone', auth, async (req, res) => {
  try {
    const { milestoneId } = req.body;
    const userId = req.user.id;

    if (!milestoneId) {
      return res.status(400).json({
        success: false,
        error: 'Milestone ID is required'
      });
    }

    // Check available milestones
    const availableMilestones = await checkMilestones(userId);
    const milestone = availableMilestones.find(m => m.id === milestoneId);

    if (!milestone) {
      return res.status(400).json({
        success: false,
        error: 'Milestone not available or already claimed'
      });
    }

    // Create transaction
    const { transaction, newBalance } = await createTransaction(
      userId,
      'milestone_bonus',
      milestone.reward,
      `🎉 ${milestone.name} milestone achieved!`,
      { metadata: { milestoneId, milestoneName: milestone.name } }
    );

    // Mark milestone as claimed
    await User.findByIdAndUpdate(userId, {
      $push: { 'metadata.claimedMilestones': milestoneId }
    });

    // Create notification
    const Notification = mongoose.model('Notification');
    const notification = new Notification({
      recipient: userId,
      type: 'milestone',
      data: {
        milestoneType: milestone.type,
        milestoneName: milestone.name,
        reward: milestone.reward
      }
    });
    await notification.save();

    res.json({
      success: true,
      data: {
        milestone,
        reward: milestone.reward,
        newBalance,
        message: `🎉 Congratulations! You earned ${milestone.reward} V-TKN for ${milestone.name}!`
      }
    });

  } catch (error) {
    console.error('Claim milestone error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while claiming milestone'
    });
  }
});

// @route   POST /api/tokens/tip
// @desc    Tip another user
// @access  Private
router.post('/tip', auth, async (req, res) => {
  try {
    const { recipientUsername, amount, postId } = req.body;
    const senderId = req.user.id;

    // Validation
    if (!recipientUsername || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Recipient and amount are required'
      });
    }

    const tipAmount = parseInt(amount);

    if (isNaN(tipAmount) || tipAmount < 1 || tipAmount > 100) {
      return res.status(400).json({
        success: false,
        error: 'Tip amount must be between 1 and 100 V-TKN'
      });
    }

    // Get sender
    const sender = await User.findById(senderId);
    if (sender.vtokens < tipAmount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Get recipient
    const recipient = await User.findOne({ 
      username: recipientUsername.toLowerCase().replace('@', '') 
    });
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (sender._id.equals(recipient._id)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot tip yourself'
      });
    }

    // Create transactions
    await createTransaction(
      senderId,
      'tip_sent',
      -tipAmount,
      `Tip to @${recipient.username}`,
      { relatedUser: recipient._id, relatedPost: postId }
    );

    const { newBalance } = await createTransaction(
      recipient._id,
      'tip_received',
      tipAmount,
      `Tip from @${sender.username}`,
      { relatedUser: sender._id, relatedPost: postId }
    );

    // Create notification
    const Notification = mongoose.model('Notification');
    const notification = new Notification({
      recipient: recipient._id,
      type: 'token_reward',
      fromUser: sender._id,
      post: postId,
      data: {
        amount: tipAmount,
        reason: 'tip'
      }
    });
    await notification.save();

    res.json({
      success: true,
      data: {
        amount: tipAmount,
        recipient: recipient.username,
        message: `Successfully tipped ${tipAmount} V-TKN to @${recipient.username}`
      }
    });

  } catch (error) {
    console.error('Tip error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing tip'
    });
  }
});

// @route   GET /api/tokens/leaderboard
// @desc    Get token earnings leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'weekly', limit = 50 } = req.query;

    // Calculate date range
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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

    const leaderboard = await Transaction.aggregate([
      {
        $match: {
          amount: { $gt: 0 },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          totalEarned: { $sum: '$amount' }
        }
      },
      { $sort: { totalEarned: -1 } },
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
            verificationBadge: '$user.verificationBadge'
          },
          totalEarned: 1
        }
      }
    ]);

    // Add ranks
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
    console.error('Token leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching leaderboard'
    });
  }
});

module.exports = router;