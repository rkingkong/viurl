const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPaymentIntent } = require('../services/stripeService');

router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency, paymentMethod } = req.body;
  try {
    const paymentIntent = await createPaymentIntent(amount, currency, paymentMethod);
    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/confirm-payment-intent', async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const paymentIntent = await confirmPaymentIntent(paymentIntentId);
    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
