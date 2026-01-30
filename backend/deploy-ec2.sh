#!/bin/bash

# AWS EC2 Backend Deployment Script
# Run on EC2 instance after SSH connection

set -e  # Exit on error

echo "🚀 AWS EC2 Backend Deployment Script"
echo "===================================="

# Update system
echo "📦 Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Step 2: Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "✓ Node.js version: $(node -v)"
echo "✓ npm version: $(npm -v)"

# Install PM2
echo "📦 Step 3: Installing PM2..."
sudo npm install -g pm2

# Install Git
echo "📦 Step 4: Installing Git..."
sudo apt install git -y

# Clone repository (NEW REPO: -hexacv-complete)
REPO_URL="${REPO_URL:-https://github.com/ANANDU-2000/-hexacv-complete.git}"
REPO_DIR="${REPO_DIR:-hexacv}"
echo "📦 Step 5: Cloning repository ($REPO_URL)..."
if [ -d "$REPO_DIR" ]; then
    echo "Repository already exists, pulling latest..."
    cd "$REPO_DIR"
    git pull origin main
    cd ..
else
    git clone "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR/backend"

# Install dependencies
echo "📦 Step 6: Installing dependencies..."
npm ci --production

# Create .env file
echo "⚙️  Step 7: Creating .env file..."
cat > .env << 'EOF'
# Database (AWS RDS)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@hexacv-db.XXXXXX.us-east-1.rds.amazonaws.com:5432/hexacv

# AI Services (CRITICAL - KEEP SECRET)
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
OPENAI_API_KEY=sk_XXXXXXXXXXXXXXXXXXXXXXXX

# Payment (Razorpay)
RAZORPAY_KEY_ID=rzp_live_XXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXX

# Admin
ADMIN_PASSWORD=CHANGE_THIS_PASSWORD

# Session (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=GENERATE_RANDOM_32_BYTE_HEX

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://hexacv.online
EOF

echo "⚠️  IMPORTANT: Edit .env file with real values!"
echo "Run: nano .env"
read -p "Press Enter after editing .env file..."

# Run database migration
echo "🗄️  Step 8: Running database migration..."
npm run migrate

# Build backend
echo "🔨 Step 9: Building backend..."
npm run build

# Start with PM2
echo "🚀 Step 10: Starting backend with PM2..."
pm2 start dist/server.js --name hexacv-backend

# Setup auto-restart on reboot
echo "🔄 Step 11: Setting up auto-restart..."
pm2 startup systemd -u $USER --hp $HOME
pm2 save

# Check status
echo "✅ Backend deployment complete!"
pm2 status

echo ""
echo "Next steps:"
echo "1. Install Nginx: sudo apt install nginx -y"
echo "2. Configure reverse proxy (see setup-nginx.sh)"
echo "3. Install SSL certificate: sudo certbot --nginx -d api.hexacv.online"
