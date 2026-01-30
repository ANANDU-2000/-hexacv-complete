#!/bin/bash
# ==============================================
# AWS EC2 Deployment Script for HexaCV Backend
# ==============================================
# This script deploys the backend to AWS EC2
# Run this on your EC2 instance after SSH

set -e  # Exit on any error

echo "🚀 Starting HexaCV Backend Deployment on AWS EC2..."

# ==============================================
# 1. UPDATE SYSTEM
# ==============================================
echo "📦 Step 1/8: Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ==============================================
# 2. INSTALL NODE.JS 20.x LTS
# ==============================================
echo "📦 Step 2/8: Installing Node.js 20.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# ==============================================
# 3. INSTALL PM2 (Process Manager)
# ==============================================
echo "📦 Step 3/8: Installing PM2 process manager..."
sudo npm install -g pm2

# ==============================================
# 4. INSTALL GIT
# ==============================================
echo "📦 Step 4/8: Installing Git..."
sudo apt-get install -y git

# ==============================================
# 5. CLONE REPOSITORY (NEW REPO: -hexacv-complete)
# ==============================================
echo "📦 Step 5/8: Cloning repository..."
cd /home/ubuntu
if [ -d "hexacv" ]; then
    echo "Repository already exists, updating remote URL and pulling latest changes..."
    cd hexacv
    git remote set-url origin https://github.com/ANANDU-2000/-hexacv-complete.git
    git pull origin main
else
    git clone https://github.com/ANANDU-2000/-hexacv-complete.git hexacv
    cd hexacv
fi

# ==============================================
# 6. INSTALL BACKEND DEPENDENCIES
# ==============================================
echo "📦 Step 6/8: Installing backend dependencies..."
cd backend
npm install --production

# ==============================================
# 7. BUILD BACKEND
# ==============================================
echo "🔨 Step 7/8: Building backend TypeScript..."
npm run build

# ==============================================
# 8. CONFIGURE ENVIRONMENT
# ==============================================
echo "⚙️  Step 8/8: Setting up environment variables..."
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit the .env file with your actual credentials:"
    echo "   nano .env"
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL (AWS RDS PostgreSQL connection string)"
    echo "  - GEMINI_API_KEY (AI service)"
    echo "  - GROQ_API_KEY (AI service)"
    echo "  - OPENAI_API_KEY (Premium AI rewrite - NEW)"
    echo "  - RAZORPAY_KEY_ID (Test keys for now)"
    echo "  - RAZORPAY_KEY_SECRET"
    echo "  - ADMIN_PASSWORD (Change from default)"
    echo "  - SESSION_SECRET (Generate random string)"
    echo "  - FRONTEND_URL (Your Vercel domain)"
    echo ""
else
    echo ".env file already exists, skipping..."
fi

# ==============================================
# 9. START WITH PM2
# ==============================================
echo "🚀 Starting backend with PM2..."
pm2 stop hexacv-backend 2>/dev/null || true
pm2 delete hexacv-backend 2>/dev/null || true
pm2 start npm --name "hexacv-backend" -- start
pm2 save
pm2 startup

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env file: nano /home/ubuntu/hexacv/backend/.env"
echo "2. Run database migrations: npm run db:migrate"
echo "3. Seed initial data: npm run db:seed"
echo "4. Check logs: pm2 logs hexacv-backend"
echo "5. Configure AWS Security Group to allow port 3001"
echo ""
echo "🔗 Your backend will be accessible at: http://YOUR_EC2_PUBLIC_IP:3001"
echo ""
