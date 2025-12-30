// notifications.js - VIURL Notifications API Routes
// Location: /var/www/viurl/src/routes/notifications.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Import models
const { User, Notification } = require('../models');

// ============================================
// HELPER FUNCTIONS
// ============================================

// Format notification for response
const formatNotification = (notification) => {
  const base = {
    id: notification._id,
    type: notification.type,
    read: notification.read,
    createdAt: notification.createdAt
  };

  // Add fromUser if present
  if (notification.fromUser) {
    base.fromUser = {
      id: notification.fromUser._id,
      username: notification.fromUser.username,
      name: notification.fromUser.name,
      profilePicture: notification.fromUser.profilePicture,
      trustScore: notification.fromUser.trustScore,
      verificationBadge: notification.fromUser.verificationBadge
    };
  }

  // Add post if present
  if (notification.post) {
    base.post = {
      id: notification.post._id,
      content: notification.post.content?.substring(0, 100),
      factCheckStatus: notification.post.factCheckStatus
    };
  }

  // Add type-specific data
  if (notification.data) {
    base.data = notification.data;
  }

  return base;
};

// Create notification helper
const createNotification = async (data) => {
  const notification = new Notification(data);
  await notification.save();
  return notification;
};

// ============================================
// ROUTES
// ============================================

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cursor, limit = 20, filter } = req.query;

    const query = { recipient: userId };

    // Apply cursor pagination
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    // Apply filter
    if (filter) {
      switch (filter) {
        case 'verifications':
          query.type = { $in: ['verification', 'verified_your_post'] };
          break;
        case 'mentions':
          query.type = 'mention';
          break;
        case 'follows':
          query.type = 'follow';
          break;
        case 'tokens':
          query.type = 'token_reward';
          break;
        case 'unread':
          query.read = false;
          break;
      }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate('fromUser', 'username name profilePicture trustScore verificationBadge')
      .populate('post', 'content factCheckStatus author')
      .populate('verification', 'verdict tokenReward');

    const hasMore = notifications.length > limit;
    if (hasMore) notifications.pop();

    // Format notifications
    const formattedNotifications = notifications.map(formatNotification);

    res.json({
      success: true,
      data: {
        items: formattedNotifications,
        hasMore,
        cursor: hasMore ? notifications[notifications.length - 1].createdAt : null
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching notifications'
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    // Get breakdown by type
    const breakdown = await Notification.aggregate([
      { $match: { recipient: new mongoose.Types.ObjectId(userId), read: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const byType = breakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        count,
        byType
      }
    });

  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching unread count'
    });
  }
});

// @route   POST /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.post('/:id/read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: { message: 'Notification marked as read' }
    });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking as read'
    });
  }
});

// @route   POST /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.post('/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.body; // Optional: only mark specific type

    const query = { recipient: userId, read: false };
    
    if (type) {
      query.type = type;
    }

    const result = await Notification.updateMany(
      query,
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      data: {
        marked: result.modifiedCount,
        message: `Marked ${result.modifiedCount} notifications as read`
      }
    });

  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking all as read'
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: { message: 'Notification deleted' }
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting notification'
    });
  }
});

// @route   DELETE /api/notifications
// @desc    Delete all notifications (or by type)
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, olderThan } = req.query;

    const query = { recipient: userId };

    if (type) {
      query.type = type;
    }

    if (olderThan) {
      query.createdAt = { $lt: new Date(olderThan) };
    }

    const result = await Notification.deleteMany(query);

    res.json({
      success: true,
      data: {
        deleted: result.deletedCount,
        message: `Deleted ${result.deletedCount} notifications`
      }
    });

  } catch (error) {
    console.error('Delete notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting notifications'
    });
  }
});

// @route   GET /api/notifications/settings
// @desc    Get notification settings
// @access  Private
router.get('/settings', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('notificationSettings');

    res.json({
      success: true,
      data: user.notificationSettings || {
        push: {
          verifications: true,
          follows: true,
          mentions: true,
          reposts: true,
          comments: true,
          messages: true,
          tokenRewards: true
        },
        email: {
          verifications: true,
          follows: false,
          weeklyDigest: true,
          tokenRewards: true,
          securityAlerts: true
        }
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching settings'
    });
  }
});

// @route   PUT /api/notifications/settings
// @desc    Update notification settings
// @access  Private
router.put('/settings', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { push, email } = req.body;

    const updateData = {};

    if (push) {
      Object.keys(push).forEach(key => {
        updateData[`notificationSettings.push.${key}`] = push[key];
      });
    }

    if (email) {
      Object.keys(email).forEach(key => {
        updateData[`notificationSettings.email.${key}`] = email[key];
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('notificationSettings');

    res.json({
      success: true,
      data: user.notificationSettings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating settings'
    });
  }
});

// @route   GET /api/notifications/summary
// @desc    Get notification summary (for widgets/badges)
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts by type
    const summary = await Notification.aggregate([
      { 
        $match: { 
          recipient: new mongoose.Types.ObjectId(userId),
          read: false,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        } 
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          latest: { $max: '$createdAt' }
        }
      }
    ]);

    // Get latest notifications (for preview)
    const latest = await Notification.find({
      recipient: userId,
      read: false
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('fromUser', 'username name profilePicture')
      .populate('post', 'content');

    const totalUnread = summary.reduce((sum, item) => sum + item.count, 0);

    res.json({
      success: true,
      data: {
        totalUnread,
        byType: summary.reduce((acc, item) => {
          acc[item._id] = { count: item.count, latest: item.latest };
          return acc;
        }, {}),
        preview: latest.map(formatNotification)
      }
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching summary'
    });
  }
});

// ============================================
// NOTIFICATION CREATION HELPERS (for other routes)
// ============================================

// These can be imported by other route files

const notificationHelpers = {
  // Create follow notification
  createFollowNotification: async (followerId, followedId) => {
    return createNotification({
      recipient: followedId,
      type: 'follow',
      fromUser: followerId
    });
  },

  // Create mention notification
  createMentionNotification: async (mentionerId, mentionedId, postId) => {
    return createNotification({
      recipient: mentionedId,
      type: 'mention',
      fromUser: mentionerId,
      post: postId
    });
  },

  // Create repost notification
  createRepostNotification: async (reposterId, originalAuthorId, postId) => {
    return createNotification({
      recipient: originalAuthorId,
      type: 'repost',
      fromUser: reposterId,
      post: postId
    });
  },

  // Create comment notification
  createCommentNotification: async (commenterId, postAuthorId, postId, commentId) => {
    return createNotification({
      recipient: postAuthorId,
      type: 'comment',
      fromUser: commenterId,
      post: postId,
      comment: commentId
    });
  },

  // Create verification notification
  createVerificationNotification: async (verifierId, postAuthorId, postId, verificationId, verdict) => {
    return createNotification({
      recipient: postAuthorId,
      type: 'verified_your_post',
      fromUser: verifierId,
      post: postId,
      verification: verificationId,
      data: { verdict }
    });
  },

  // Create token reward notification
  createTokenRewardNotification: async (userId, amount, reason, relatedPostId = null) => {
    return createNotification({
      recipient: userId,
      type: 'token_reward',
      post: relatedPostId,
      data: { tokenAmount: amount, tokenReason: reason }
    });
  },

  // Create badge notification
  createBadgeNotification: async (userId, badgeType) => {
    return createNotification({
      recipient: userId,
      type: 'badge',
      data: { badgeType }
    });
  },

  // Create milestone notification
  createMilestoneNotification: async (userId, milestoneType, milestoneValue) => {
    return createNotification({
      recipient: userId,
      type: 'milestone',
      data: { milestoneType, milestoneValue }
    });
  },

  // Create system notification
  createSystemNotification: async (userId, message) => {
    return createNotification({
      recipient: userId,
      type: 'system',
      data: { systemMessage: message }
    });
  }
};

// Export router and helpers
module.exports = router;
module.exports.notificationHelpers = notificationHelpers;