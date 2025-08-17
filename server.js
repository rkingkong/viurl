// server.js - Main Server File for Viurl
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000; // Changed to 5000

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viurlDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  // Don't exit - server can still run for testing
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',     // Vite dev server
    'http://localhost:4173',     // Vite preview
    'http://localhost:3000',     // Alternative frontend
    'https://viurl.com',         // Production
    'http://18.222.211.175'      // Direct IP access
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Import all routes
const authRoutes = require('./src/routes/auth');
const postsRoutes = require('./src/routes/posts');
const usersRoutes = require('./src/routes/users');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Viurl API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    endpoints: {
      auth: '/api/auth/login, /api/auth/register, /api/auth/me',
      posts: '/api/posts (GET/POST), /api/posts/:id',
      users: '/api/users/:id, /api/users/profile, /api/users/:id/follow'
    }
  });
});

// Serve landing page for root
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      name: 'Viurl API',
      status: 'running',
      message: 'Welcome to Viurl - The Verified Social Network',
      documentation: '/api/test'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      error: 'Validation Error',
      details: errors
    });
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ 
      error: `Duplicate value`,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  
  // Default error
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║           VIURL SERVER v1.0.0              ║
║                                            ║
║   🚀 Server:    http://localhost:${PORT}     ║
║   📡 API Base:  http://localhost:${PORT}/api ║
║   🌐 Public:    https://viurl.com         ║
║   💾 MongoDB:   ${mongoose.connection.readyState === 1 ? '✅ Connected' : '⚠️  Disconnected'}          ║
║                                            ║
║   Endpoints:                               ║
║   • Health:  GET  /api/health              ║
║   • Auth:    POST /api/auth/login          ║
║   • Posts:   GET  /api/posts               ║
║   • Users:   GET  /api/users/:id           ║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;