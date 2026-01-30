# AWS DEPLOYMENT GUIDE

## Option 1: AWS EC2 (Recommended for Full Control)

### Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2
2. Click "Launch Instance"
3. Choose Ubuntu 22.04 LTS
4. Select instance type: t3.medium or t3.large (2 vCPU, 4GB RAM)
5. Create or select a key pair
6. Configure security group:
   - SSH (port 22) - your IP only
   - HTTP (port 80) - 0.0.0.0/0
   - HTTPS (port 443) - 0.0.0.0/0
   - Custom TCP (port 3001) - 0.0.0.0/0 (for API)

### Step 2: Connect to EC2
```bash
# SSH into your instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 3: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

### Step 4: Set up Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE hexacv;
CREATE USER hexacv_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE hexacv TO hexacv_admin;
\q
```

### Step 5: Deploy Backend
```bash
# Clone your repository (after pushing to GitHub)
git clone https://github.com/ANANDU-2000/hexaresume.git
cd hexaresume/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=3001
DB_HOST=localhost
DB_NAME=hexacv
DB_USER=hexacv_admin
DB_PASS=your_secure_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret_here
VITE_GEMINI_API_KEY=your_gemini_key
VITE_GROQ_API_KEY=your_groq_key
VITE_OPENAI_API_KEY=your_openai_key
NODE_ENV=production
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
EOF

# Run database migrations
npm run migrate

# Start with PM2
pm2 start dist/server.js --name hexacv-api
pm2 startup
pm2 save
```

### Step 6: Set up Nginx (Reverse Proxy)
```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/hexacv

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 public IP

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
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/hexacv /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Update Vercel Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:
```
VITE_API_URL = http://your-ec2-public-ip:3001
# or if you have a domain:
VITE_API_URL = https://api.yourdomain.com
```

## Option 2: Vercel Serverless (Easier but Limited)

### For Backend API on Vercel:
1. Create separate Vercel project for backend
2. Set environment variables in Vercel dashboard
3. Deploy backend first
4. Update frontend VITE_API_URL to backend URL

## Option 3: AWS Elastic Beanstalk

### Deploy with EB CLI:
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js hexacv-backend
eb create hexacv-env
eb deploy
```

## Security Best Practices

1. **Database Security:**
   - Use strong passwords
   - Limit database access to EC2 only
   - Enable PostgreSQL authentication

2. **API Security:**
   - Use HTTPS (set up SSL certificate)
   - Implement rate limiting (already in code)
   - Use JWT for authentication

3. **Environment Variables:**
   - Never commit .env files
   - Use AWS Secrets Manager for sensitive data
   - Rotate API keys regularly

## Monitoring

```bash
# Check PM2 status
pm2 status
pm2 logs hexacv-api

# Check system resources
htop
df -h

# Check Nginx status
sudo systemctl status nginx
```

## Backup Strategy

1. **Database Backup:**
```bash
# Create backup script
cat > backup-db.sh << EOF
#!/bin/bash
pg_dump hexacv > /home/ubuntu/backups/hexacv-$(date +%Y%m%d).sql
EOF

# Make executable and schedule
chmod +x backup-db.sh
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-db.sh
```

2. **Code Backup:**
   - GitHub repository (automatic)
   - Regular git pushes

## Cost Estimation (EC2 Option)

- t3.medium instance: ~$35/month
- 20GB SSD storage: ~$2/month
- Data transfer: ~$5/month (est.)
- **Total: ~$42/month**

## Troubleshooting

1. **API not responding:**
   ```bash
   pm2 logs hexacv-api
   sudo systemctl status nginx
   ```

2. **Database connection failed:**
   ```bash
   sudo -u postgres psql -d hexacv
   ```

3. **Frontend can't reach backend:**
   - Check VITE_API_URL in Vercel
   - Verify EC2 security groups
   - Test API endpoint directly