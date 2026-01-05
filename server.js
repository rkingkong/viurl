// server.js - VIURL Main Server Entry Point
// Location: /var/www/viurl/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// ============================================
// APP INITIALIZATION
// ============================================

const app = express();
const server = http.createServer(app);

// Socket.IO for real-time features
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://viurl.com',
    methods: ['GET', 'POST']
  }
});

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/viurl';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📦 Database: ${MONGODB_URI.split('/').pop().split('?')[0]}`);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? ['https://viurl.com', 'https://www.viurl.com']
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Stricter limit for auth endpoints
  message: {
    success: false,
    error: 'Too many login attempts, please try again later'
  }
});

const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 verifications per hour
  message: {
    success: false,
    error: 'Verification rate limit reached, please try again later'
  }
});

// Apply general rate limit to all routes
app.use('/api/', generalLimiter);

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ============================================
// IMPORT ROUTES
// ============================================

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const postRoutes = require('./src/routes/posts');
const verificationRoutes = require('./src/routes/verification');
const tokenRoutes = require('./src/routes/tokens');
const messageRoutes = require('./src/routes/messages');
const notificationRoutes = require('./src/routes/notifications');
const searchRoutes = require('./src/routes/search');
const reportRoutes = require('./src/routes/reports');

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'VIURL API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth routes (with stricter rate limiting)
app.use('/api/auth', authLimiter, authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Post routes
app.use('/api/posts', postRoutes);

// Verification routes (with rate limiting)
app.use('/api/verifications', verificationLimiter, verificationRoutes);

// Token routes
app.use('/api/tokens', tokenRoutes);

// Message routes
app.use('/api/messages', messageRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Search routes
app.use('/api/search', searchRoutes);

// Report routes
app.use('/api/reports', reportRoutes);

// ============================================
// STATIC FILES & CLIENT
// ============================================

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React client in production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));

  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  });
}

// ============================================
// WEBSOCKET HANDLING
// ============================================

// Online users tracking
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // User joins (authenticate and track)
  socket.on('user:join', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(`user:${userId}`);
      
      // Broadcast online status
      io.emit('user:online', { userId });
      console.log(`👤 User ${userId} is online`);
    }
  });

  // Join conversation room
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`💬 User joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  // Typing indicator
  socket.on('typing:start', ({ conversationId, userId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing:start', { userId });
  });

  socket.on('typing:stop', ({ conversationId, userId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId });
  });

  // New message (for real-time updates)
  socket.on('message:send', (data) => {
    const { conversationId, message } = data;
    socket.to(`conversation:${conversationId}`).emit('message:new', message);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('user:offline', { userId: socket.userId });
      console.log(`👋 User ${socket.userId} disconnected`);
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Helper to send real-time notifications
app.locals.sendNotification = (userId, notification) => {
  io.to(`user:${userId}`).emit('notification:new', notification);
};

// Helper to send real-time message
app.locals.sendMessage = (conversationId, message) => {
  io.to(`conversation:${conversationId}`).emit('message:new', message);
};

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const shutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  // Close socket connections
  io.close(() => {
    console.log('✅ Socket.IO connections closed');
  });

  // Close MongoDB connection
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');

  // Close HTTP server
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forcing shutdown...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// ============================================
// START SERVER
// ============================================

server.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 VIURL Server Started!');
  console.log('========================================');
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log('========================================\n');
});

// Export for testing
module.exports = { app, server, io };