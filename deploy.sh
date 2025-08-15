#!/bin/bash

# deploy.sh - Deployment Script for Viurl
# This script sets up and deploys Viurl to production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        VIURL DEPLOYMENT SCRIPT             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
else
    print_success "Node.js $(node -v) found"
fi

if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
else
    print_success "npm $(npm -v) found"
fi

if ! command_exists pm2; then
    print_warning "PM2 not found. Installing globally..."
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 found"
fi

# Step 2: Set working directory
cd /var/www/viurl
print_success "Working directory: $(pwd)"

# Step 3: Install backend dependencies
print_status "Installing backend dependencies..."
if [ -f "package.json" ]; then
    npm install
    print_success "Backend dependencies installed"
else
    print_warning "No package.json found in backend. Creating one..."
    cat > package.json << 'EOF'
{
  "name": "viurl-backend",
  "version": "1.0.0",
  "description": "Viurl - The Verified Social Network Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node test-auth.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF
    npm install
    print_success "Package.json created and dependencies installed"
fi

# Step 4: Setup environment variables
print_status "Setting up environment variables..."
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating one..."
    cat > .env << 'EOF'
# Viurl Backend Environment Variables
NODE_ENV=production
PORT=5000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/viurlDB

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Origins
CORS_ORIGINS=https://viurl.com,http://localhost:5173,http://localhost:4173

# Token Settings
TOKEN_EXPIRY=7d

# API Settings
API_RATE_LIMIT=100
API_RATE_WINDOW=15
EOF
    print_success ".env file created (Please update JWT_SECRET!)"
else
    print_success ".env file exists"
fi

# Step 5: Install frontend dependencies
print_status "Installing frontend dependencies..."
cd client
if [ -f "package.json" ]; then
    npm install
    print_success "Frontend dependencies installed"
else
    print_error "No package.json found in client directory"
    exit 1
fi

# Step 6: Build frontend for production
print_status "Building frontend for production..."
npm run build
print_success "Frontend built successfully"

# Step 7: Go back to root directory
cd /var/www/viurl

# Step 8: Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || true

# Step 9: Start services with PM2
print_status "Starting services with PM2..."

# Create ecosystem file if it doesn't exist
if [ ! -f "ecosystem.config.js" ]; then
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'viurl-backend',
      script: './server.js',
      cwd: '/var/www/viurl',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'viurl-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/var/www/viurl/client',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4173
      },
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_file: '../logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF
    print_success "PM2 ecosystem file created"
fi

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js
print_success "Services started with PM2"

# Step 10: Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"

# Step 11: Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup systemd -u $USER --hp /home/$USER
print_success "PM2 startup script configured"

# Step 12: Configure nginx (if installed)
if command_exists nginx; then
    print_status "Configuring nginx..."
    
    # Create nginx config
    sudo tee /etc/nginx/sites-available/viurl > /dev/null << 'EOF'
server {
    listen 80;
    server_name viurl.com www.viurl.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support (for future real-time features)
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/viurl /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    sudo nginx -t
    
    # Reload nginx
    sudo systemctl reload nginx
    print_success "Nginx configured and reloaded"
else
    print_warning "Nginx not found. Skipping web server configuration."
fi

# Step 13: Test the deployment
print_status "Testing deployment..."
sleep 3  # Wait for services to start

# Test backend
if curl -s http://localhost:5000/api/health > /dev/null; then
    print_success "Backend is running on port 5000"
else
    print_error "Backend is not responding"
fi

# Test frontend
if curl -s http://localhost:4173 > /dev/null; then
    print_success "Frontend is running on port 4173"
else
    print_error "Frontend is not responding"
fi

# Step 14: Show status
echo ""
print_status "Deployment Status:"
pm2 status

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🎉 DEPLOYMENT COMPLETED!              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Service URLs:${NC}"
echo -e "   Backend API:  http://localhost:5000/api"
echo -e "   Frontend:     http://localhost:4173"
echo -e "   Public URL:   https://viurl.com"
echo ""
echo -e "${BLUE}📋 Useful PM2 Commands:${NC}"
echo -e "   pm2 status       - Check service status"
echo -e "   pm2 logs         - View all logs"
echo -e "   pm2 restart all  - Restart all services"
echo -e "   pm2 monit        - Monitor services"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo -e "   1. Update JWT_SECRET in .env file"
echo -e "   2. Configure MongoDB connection string"
echo -e "   3. Set up SSL certificate for HTTPS"
echo -e "   4. Configure firewall rules if needed"
echo ""

# Create a quick status check script
cat > check-status.sh << 'EOF'
#!/bin/bash
echo "🔍 Checking Viurl Status..."
echo ""
echo "PM2 Services:"
pm2 status
echo ""
echo "Backend Health:"
curl -s http://localhost:5000/api/health | python3 -m json.tool
echo ""
echo "Port Status:"
sudo netstat -tlnp | grep -E ':(5000|4173|80|443)'
EOF

chmod +x check-status.sh
print_success "Status check script created: ./check-status.sh"

exit 0