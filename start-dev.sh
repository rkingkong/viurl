#!/bin/bash
echo "Starting Viurl Development Environment..."

# Start backend
cd /var/www/viurl
echo "Starting backend server..."
node server.js &
BACKEND_PID=$!

# Start frontend
cd /var/www/viurl/client
echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
