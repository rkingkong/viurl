// messages.js - VIURL Direct Messages API Routes
// Location: /var/www/viurl/src/routes/messages.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Import models
const { User, Conversation, Message, Notification } = require('../models');

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get or create conversation between two users
const getOrCreateConversation = async (userId1, userId2) => {
  // Find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [userId1, userId2], $size: 2 }
  });

  if (!conversation) {
    // Create new conversation
    conversation = new Conversation({
      participants: [userId1, userId2],
      unreadCounts: new Map([[userId1.toString(), 0], [userId2.toString(), 0]]),
      settings: new Map()
    });
    await conversation.save();
  }

  return conversation;
};

// Format conversation for response
const formatConversation = async (conversation, currentUserId) => {
  // Get the other participant
  const otherParticipantId = conversation.participants.find(
    p => p.toString() !== currentUserId.toString()
  );

  const otherUser = await User.findById(otherParticipantId)
    .select('username name profilePicture trustScore verificationBadge');

  const unreadCount = conversation.unreadCounts?.get(currentUserId.toString()) || 0;
  const settings = conversation.settings?.get(currentUserId.toString()) || {};

  return {
    id: conversation._id,
    participant: {
      id: otherUser._id,
      username: otherUser.username,
      name: otherUser.name,
      profilePicture: otherUser.profilePicture,
      trustScore: otherUser.trustScore,
      verificationBadge: otherUser.verificationBadge
    },
    lastMessage: conversation.lastMessage,
    unreadCount,
    isMuted: settings.muted || false,
    isPinned: settings.pinned || false,
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt
  };
};

// ============================================
// ROUTES
// ============================================

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cursor, limit = 20 } = req.query;

    const query = { participants: userId };

    if (cursor) {
      query.updatedAt = { $lt: new Date(cursor) };
    }

    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit) + 1);

    const hasMore = conversations.length > limit;
    if (hasMore) conversations.pop();

    // Format conversations with participant info
    const formattedConversations = await Promise.all(
      conversations.map(conv => formatConversation(conv, userId))
    );

    // Calculate total unread
    const totalUnread = formattedConversations.reduce(
      (sum, conv) => sum + conv.unreadCount, 0
    );

    res.json({
      success: true,
      data: {
        items: formattedConversations,
        totalUnread,
        hasMore,
        cursor: hasMore ? conversations[conversations.length - 1].updatedAt : null
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching conversations'
    });
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Get a single conversation
// @access  Private
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const formatted = await formatConversation(conversation, userId);

    res.json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching conversation'
    });
  }
});

// @route   POST /api/messages/conversations
// @desc    Start a new conversation
// @access  Private
router.post('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId, recipientUsername } = req.body;

    // Get recipient by ID or username
    let recipient;
    if (recipientId) {
      recipient = await User.findById(recipientId);
    } else if (recipientUsername) {
      recipient = await User.findOne({ 
        username: recipientUsername.toLowerCase().replace('@', '') 
      });
    }

    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Can't message yourself
    if (recipient._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot start conversation with yourself'
      });
    }

    // Check if user allows DMs
    const currentUser = await User.findById(userId);
    const dmSetting = recipient.settings?.allowDMs || 'everyone';

    if (dmSetting === 'none') {
      return res.status(403).json({
        success: false,
        error: 'This user has disabled direct messages'
      });
    }

    if (dmSetting === 'followers' && !recipient.followersList?.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'This user only accepts messages from followers'
      });
    }

    if (dmSetting === 'verified' && currentUser.verificationBadge === 'none') {
      return res.status(403).json({
        success: false,
        error: 'This user only accepts messages from verified users'
      });
    }

    // Check if blocked
    if (recipient.blockedUsers?.includes(userId) || currentUser.blockedUsers?.includes(recipient._id)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot message this user'
      });
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(userId, recipient._id);
    const formatted = await formatConversation(conversation, userId);

    res.status(201).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating conversation'
    });
  }
});

// @route   GET /api/messages/conversations/:id/messages
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const { cursor, limit = 50 } = req.query;

    // Verify user is in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const query = { conversation: conversationId };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .populate('sender', 'username name profilePicture')
      .populate('sharedPost', 'content author')
      .populate({
        path: 'sharedPost',
        populate: {
          path: 'author',
          select: 'username name'
        }
      });

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    // Reverse to get chronological order
    messages.reverse();

    res.json({
      success: true,
      data: {
        items: messages,
        hasMore,
        cursor: hasMore ? messages[0].createdAt : null
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching messages'
    });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, recipientId, content, type = 'text', sharedPostId } = req.body;

    // Validation
    if (!content && type === 'text') {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    let conversation;

    // Get or create conversation
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }
    } else if (recipientId) {
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          error: 'Recipient not found'
        });
      }
      conversation = await getOrCreateConversation(userId, recipientId);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID or recipient ID is required'
      });
    }

    // Get recipient ID
    const recipientUserId = conversation.participants.find(
      p => p.toString() !== userId
    );

    // Create message
    const message = new Message({
      conversation: conversation._id,
      sender: userId,
      content,
      type,
      ...(sharedPostId && { sharedPost: sharedPostId }),
      status: 'sent'
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = {
      content: type === 'text' ? content : `Shared ${type}`,
      senderId: userId,
      type,
      timestamp: new Date()
    };
    conversation.updatedAt = new Date();

    // Increment unread count for recipient
    const currentUnread = conversation.unreadCounts?.get(recipientUserId.toString()) || 0;
    conversation.unreadCounts.set(recipientUserId.toString(), currentUnread + 1);

    await conversation.save();

    // Create notification for recipient
    const notification = new Notification({
      recipient: recipientUserId,
      type: 'dm',
      fromUser: userId,
      data: {
        conversationId: conversation._id,
        preview: content.substring(0, 50)
      }
    });
    await notification.save();

    // Populate and return
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username name profilePicture')
      .populate('sharedPost', 'content author');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while sending message'
    });
  }
});

// @route   POST /api/messages/conversations/:id/read
// @desc    Mark conversation as read
// @access  Private
router.post('/conversations/:id/read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Reset unread count
    conversation.unreadCounts.set(userId.toString(), 0);
    await conversation.save();

    // Mark all messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        read: false
      },
      {
        read: true,
        readAt: new Date(),
        status: 'read'
      }
    );

    res.json({
      success: true,
      data: { message: 'Conversation marked as read' }
    });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking as read'
    });
  }
});

// @route   DELETE /api/messages/conversations/:id
// @desc    Delete/leave a conversation
// @access  Private
router.delete('/conversations/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // For now, we'll just delete the conversation
    // In production, you might want to soft-delete or just remove the user
    await Message.deleteMany({ conversation: conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    res.json({
      success: true,
      data: { message: 'Conversation deleted' }
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting conversation'
    });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get total unread message count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ participants: userId });

    let totalUnread = 0;
    for (const conv of conversations) {
      totalUnread += conv.unreadCounts?.get(userId.toString()) || 0;
    }

    res.json({
      success: true,
      data: { count: totalUnread }
    });

  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching unread count'
    });
  }
});

// @route   PUT /api/messages/conversations/:id/settings
// @desc    Update conversation settings (mute, pin)
// @access  Private
router.put('/conversations/:id/settings', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const { muted, pinned } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const currentSettings = conversation.settings?.get(userId.toString()) || {};
    
    if (typeof muted === 'boolean') currentSettings.muted = muted;
    if (typeof pinned === 'boolean') currentSettings.pinned = pinned;

    conversation.settings.set(userId.toString(), currentSettings);
    await conversation.save();

    res.json({
      success: true,
      data: { settings: currentSettings }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating settings'
    });
  }
});

// @route   POST /api/messages/share-post
// @desc    Share a post via DM
// @access  Private
router.post('/share-post', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, recipientIds, message } = req.body;

    if (!postId || !recipientIds || !recipientIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Post ID and recipients are required'
      });
    }

    const Post = mongoose.model('Post');
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const results = [];

    for (const recipientId of recipientIds) {
      // Get or create conversation
      const conversation = await getOrCreateConversation(userId, recipientId);

      // Create message with shared post
      const msg = new Message({
        conversation: conversation._id,
        sender: userId,
        content: message || 'Shared a post',
        type: 'post_share',
        sharedPost: postId,
        status: 'sent'
      });

      await msg.save();

      // Update conversation
      conversation.lastMessage = {
        content: 'Shared a post',
        senderId: userId,
        type: 'post_share',
        timestamp: new Date()
      };
      conversation.updatedAt = new Date();

      const currentUnread = conversation.unreadCounts?.get(recipientId.toString()) || 0;
      conversation.unreadCounts.set(recipientId.toString(), currentUnread + 1);

      await conversation.save();

      results.push({
        recipientId,
        conversationId: conversation._id,
        messageId: msg._id
      });
    }

    res.json({
      success: true,
      data: {
        shared: results.length,
        results
      }
    });

  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while sharing post'
    });
  }
});

module.exports = router;