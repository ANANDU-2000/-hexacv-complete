#!/bin/bash
# AWS EC2 & RDS Update Script
# Usage: ./UPDATE-AWS-EC2-AND-DATABASE.sh
# Or: bash UPDATE-AWS-EC2-AND-DATABASE.sh
# Update EC2 backend and RDS database - Run on EC2: ./UPDATE-AWS-EC2-AND-DATABASE.sh
set -e

echo "Updating HexaCV Backend and Database..."

# Update repository
echo "Updating repository..."
cd ~/hexacv 2>/dev/null || cd ~/hexacv-complete 2>/dev/null || {
    echo "Repository not found. Cloning..."
    git clone https://github.com/ANANDU-2000/-hexacv-complete.git hexacv
    cd hexacv
}

# Update remote URL to new repo
git remote set-url origin https://github.com/ANANDU-2000/-hexacv-complete.git

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
cd backend
npm install --production

# Update environment variables
echo "Checking environment variables..."

if [ ! -f ".env" ]; then
    echo "Creating .env from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your actual values:"
    echo "   nano .env"
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL (AWS RDS PostgreSQL)"
    echo "  - GEMINI_API_KEY, GROQ_API_KEY, OPENAI_API_KEY"
    echo "  - RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET"
    echo "  - ADMIN_PASSWORD, SESSION_SECRET"
    echo "  - FRONTEND_URL=https://your-vercel-url.vercel.app"
    echo ""
    read -p "Press Enter after editing .env file..."
else
    echo ".env file exists. Checking for OPENAI_API_KEY..."
    if ! grep -q "OPENAI_API_KEY" .env; then
        echo "Adding OPENAI_API_KEY to .env..."
        echo "" >> .env
        echo "# OpenAI API Key (NEW)" >> .env
        echo "OPENAI_API_KEY=sk-your-key-here" >> .env
        echo "⚠️  Edit .env and add your OpenAI key!"
        read -p "Press Enter after adding OpenAI key..."
    fi
fi

# Run database migrations
echo "Running database migrations..."
npm run db:migrate || {
    echo "⚠️  Migration failed. Check DATABASE_URL in .env"
    echo "Testing database connection..."
    if command -v psql &> /dev/null; then
        echo "Testing connection..."
        # Extract connection details from DATABASE_URL
        DB_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2-)
        if [ -n "$DB_URL" ]; then
            psql "$DB_URL" -c "SELECT version();" || echo "❌ Database connection failed!"
        fi
    fi
    read -p "Press Enter to continue anyway..."
}

# Build backend
echo "Building backend..."
npm run build

# Restart backend
echo "Restarting backend..."

# Stop existing process
pm2 stop hexacv-backend 2>/dev/null || true
pm2 delete hexacv-backend 2>/dev/null || true

# Start with ecosystem config
pm2 start ecosystem.config.js || pm2 start dist/server.js --name hexacv-backend

# Save PM2 config
pm2 save

# Verify
echo "Verifying..."
pm2 status
pm2 logs hexacv-backend --lines 20 --nostream
echo "Done. Check: pm2 logs hexacv-backend"
