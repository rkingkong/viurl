const express = require('express');
const router = express.Router();
const { convertToFiat, transferToBankAccount } = require('../services/exchangeService');
const User = require('../models/User');
const VIURLtoken = require('../utils/web3').VIURLtoken;

router.post('/convert', async (req, res) => {
  const { userId, cryptoAmount, cryptoType, fiatCurrency } = req.body;

  try {
    const fiatAmount = await convertToFiat(cryptoAmount, cryptoType, fiatCurrency);
    res.json({ fiatAmount });
  } catch (error) {
    res.status(500).json({ message: 'Conversion failed' });
  }
});

router.post('/transfer', async (req, res) => {
  const { userId, amount, currency } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transferSuccess = await transferToBankAccount(userId, amount, currency);
    if (transferSuccess) {
      res.json({ message: 'Transfer successful' });
    } else {
      res.status(500).json({ message: 'Transfer failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Transfer failed' });
  }
});

module.exports = router;
