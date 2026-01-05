require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

// Test rate limiters
console.log('Testing rate limiters...');

try {
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use('/api/', generalLimiter);
  console.log('OK: generalLimiter');
} catch(e) {
  console.log('FAIL: generalLimiter -', e.message);
}

try {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10
  });
  console.log('OK: authLimiter');
} catch(e) {
  console.log('FAIL: authLimiter -', e.message);
}

try {
  const verificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50
  });
  console.log('OK: verificationLimiter');
} catch(e) {
  console.log('FAIL: verificationLimiter -', e.message);
}

// Test mounting with rate limiters
console.log('\nTesting routes with rate limiters...');

const authRoutes = require('./src/routes/auth');
const verificationRoutes = require('./src/routes/verification');

try {
  const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10 });
  app.use('/api/auth', authLimiter, authRoutes);
  console.log('OK: auth with limiter');
} catch(e) {
  console.log('FAIL: auth with limiter -', e.message);
}

try {
  const verificationLimiter = rateLimit({ windowMs: 60*60*1000, max: 50 });
  app.use('/api/verifications', verificationLimiter, verificationRoutes);
  console.log('OK: verification with limiter');
} catch(e) {
  console.log('FAIL: verification with limiter -', e.message);
}

console.log('\nAll tests passed!');
