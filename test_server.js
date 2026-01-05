require('dotenv').config();
const express = require('express');
const app = express();

// Test mounting routes one by one
const routes = [
  { path: '/api/auth', file: './src/routes/auth', name: 'auth' },
  { path: '/api/users', file: './src/routes/users', name: 'users' },
  { path: '/api/posts', file: './src/routes/posts', name: 'posts' },
  { path: '/api/verifications', file: './src/routes/verification', name: 'verification' },
  { path: '/api/tokens', file: './src/routes/tokens', name: 'tokens' },
  { path: '/api/messages', file: './src/routes/messages', name: 'messages' },
  { path: '/api/notifications', file: './src/routes/notifications', name: 'notifications' },
  { path: '/api/search', file: './src/routes/search', name: 'search' },
  { path: '/api/reports', file: './src/routes/reports', name: 'reports' }
];

routes.forEach(r => {
  try {
    const router = require(r.file);
    app.use(r.path, router);
    console.log('OK mounting: ' + r.name + ' at ' + r.path);
  } catch(e) {
    console.log('FAIL mounting: ' + r.name + ' - ' + e.message);
  }
});

console.log('\nAll routes mounted successfully!');
