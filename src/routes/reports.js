const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Post, User } = require('../models');

// Submit a report
router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!['post', 'user', 'comment'].includes(targetType)) {
      return res.status(400).json({ success: false, error: 'Invalid target type' });
    }

    // For now, just log the report
    console.log('Report submitted:', {
      reporter: req.user.id,
      targetType,
      targetId,
      reason,
      description,
      createdAt: new Date()
    });

    res.json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
