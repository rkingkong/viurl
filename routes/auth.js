const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Import KYC and 2FA services
const kycService = require('../services/kycService');
const twoFactor = require('node-2fa');

// User registration
router.post('/register', async (req, res) => {
    const { username, email, password, kycDocument } = req.body;
  
    // Perform KYC verification
    const kycResult = await kycService.verifyDocument(kycDocument);
    if (!kycResult.success) {
      return res.status(400).json({ message: 'KYC verification failed' });
    }
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      kycVerified: true
    });
  
    try {
      await newUser.save();
      // Generate 2FA secret
      const newSecret = twoFactor.generateSecret({ name: 'VIURL', account: email });
      newUser.twoFactorSecret = newSecret.secret;
      await newUser.save();
      res.json({ message: 'User registered successfully', twoFactorQR: newSecret.qr });
    } catch (err) {
      res.status(500).json({ message: 'Error registering user' });
    }
  });
  
  module.exports = router;

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: newUser._id, username, email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const { getContract, initWeb3 } = require('../utils/web3');

router.post('/reward', async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const contract = await getContract();
        const accounts = await initWeb3().eth.getAccounts();
        await contract.methods.mint(userId, amount).send({ from: accounts[0] });

        user.tokens += amount;
        await user.save();

        res.json({ msg: 'Tokens rewarded successfully', tokens: user.tokens });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
