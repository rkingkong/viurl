#!/bin/bash
echo "🚀 Starting Viurl Backend Server..."
cd /var/www/viurl

# Kill any existing process on port 5000
sudo lsof -ti:5000 | xargs -r sudo kill -9 2>/dev/null || true

# Start the backend server
echo "Starting backend on port 5000..."
PORT=5000 node server.js
