const express = require('express');
const router = express.Router();
const { requestPrepaidCard } = require('../services/cardProviderService');
const User = require('../models/User');

router.post('/request-card', async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cardDetails = await requestPrepaidCard(userId, amount);
    res.json(cardDetails);
  } catch (error) {
    res.status(500).json({ message: 'Card request failed' });
  }
});

module.exports = router;
