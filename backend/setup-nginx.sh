#!/bin/bash

# Nginx Setup Script for API Subdomain
# Run after deploy-ec2.sh

set -e

echo "🌐 Setting up Nginx reverse proxy..."

# Install Nginx
echo "📦 Step 1: Installing Nginx..."
sudo apt install nginx -y

# Create Nginx configuration
echo "⚙️  Step 2: Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/hexacv-backend > /dev/null << 'EOF'
server {
    listen 80;
    server_name api.hexacv.online;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://hexacv.online' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }
}
EOF

# Enable site
echo "🔗 Step 3: Enabling site..."
sudo ln -sf /etc/nginx/sites-available/hexacv-backend /etc/nginx/sites-enabled/

# Test configuration
echo "✅ Step 4: Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "🔄 Step 5: Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Install Certbot for SSL
echo "🔒 Step 6: Installing Certbot..."
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
echo "📜 Step 7: Obtaining SSL certificate..."
echo "⚠️  Make sure DNS is configured first!"
echo "DNS should point api.hexacv.online to this EC2 IP"
read -p "Press Enter when DNS is ready..."

sudo certbot --nginx -d api.hexacv.online --non-interactive --agree-tos --email admin@hexacv.online --redirect

echo "✅ Nginx setup complete!"
echo ""
echo "Test backend health:"
echo "curl https://api.hexacv.online/health"
