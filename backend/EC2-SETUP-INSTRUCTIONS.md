# EC2 BACKEND DEPLOYMENT INSTRUCTIONS

## Prerequisites
1. AWS EC2 instance running (Ubuntu 22.04)
2. EC2 key pair downloaded (.pem file)
3. Security group configured:
   - Port 22 (SSH) from your IP
   - Port 80 (HTTP) from 0.0.0.0/0
   - Port 443 (HTTPS) from 0.0.0.0/0
   - Port 3001 (Backend) from 0.0.0.0/0
4. AWS RDS PostgreSQL instance created

## Step 1: Connect to EC2

```bash
# Save your key file
chmod 400 ~/.ssh/hexacv-backend.pem

# SSH into EC2
ssh -i ~/.ssh/hexacv-backend.pem ubuntu@[YOUR-EC2-PUBLIC-IP]
```

## Step 2: Run Deployment Script

```bash
# Download and run deployment script
curl -o deploy-ec2.sh https://raw.githubusercontent.com/ANANDU-2000/hexacv/main/backend/deploy-ec2.sh
chmod +x deploy-ec2.sh
bash deploy-ec2.sh
```

**IMPORTANT:** The script will pause and ask you to edit `.env` file.

### Edit .env with Real Values:
```bash
nano hexacv/backend/.env
```

Update these values:
- `DATABASE_URL` - Get from AWS RDS console
- `GROQ_API_KEY` - Your Groq API key
- `GEMINI_API_KEY` - Your Gemini API key (optional)
- `RAZORPAY_KEY_ID` - Your Razorpay live key
- `RAZORPAY_KEY_SECRET` - Your Razorpay secret
- `ADMIN_PASSWORD` - Strong password for admin panel
- `SESSION_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Press Ctrl+O, Enter, Ctrl+X to save.

## Step 3: Setup Nginx + SSL

```bash
# Download and run Nginx setup script
curl -o setup-nginx.sh https://raw.githubusercontent.com/ANANDU-2000/hexacv/main/backend/setup-nginx.sh
chmod +x setup-nginx.sh
bash setup-nginx.sh
```

**IMPORTANT:** Configure DNS before running this script:
- Add A record: `api.hexacv.online` → [YOUR-EC2-PUBLIC-IP]

## Step 4: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs hexacv-backend

# Test health endpoint
curl http://localhost:3001/health

# Test with domain (after DNS propagates)
curl https://api.hexacv.online/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-01-14T..."}
```

## Step 5: Configure Database (AWS RDS)

If not already done:

1. Go to AWS Console → RDS → Create Database
2. Engine: PostgreSQL 15.x
3. Template: Free tier or Production
4. Settings:
   - DB identifier: `hexacv-db`
   - Master username: `postgres`
   - Master password: [SAVE SECURELY]
5. Connectivity:
   - VPC: Default
   - Public access: No
   - VPC security group: Create new
6. Additional configuration:
   - Initial database name: `hexacv`
7. Create database

8. Configure security group:
   - Edit inbound rules
   - Add PostgreSQL (5432) from EC2 security group

9. Get connection string from RDS console:
   ```
   postgresql://postgres:[PASSWORD]@hexacv-db.xxxxxx.us-east-1.rds.amazonaws.com:5432/hexacv
   ```

10. Update `.env` file on EC2 with this connection string

## Troubleshooting

### Backend not starting:
```bash
pm2 logs hexacv-backend --lines 100
```

### Database connection failed:
```bash
# Test connection from EC2
psql "postgresql://postgres:[PASSWORD]@hexacv-db.xxx.rds.amazonaws.com:5432/hexacv"
```

### Nginx not working:
```bash
sudo systemctl status nginx
sudo nginx -t
sudo systemctl restart nginx
```

### SSL certificate failed:
```bash
# Check DNS
nslookup api.hexacv.online

# Retry certificate
sudo certbot --nginx -d api.hexacv.online
```

## Update Backend (Future Deployments)

```bash
# SSH into EC2
ssh -i ~/.ssh/hexacv-backend.pem ubuntu@[EC2-IP]

# Pull latest code
cd hexacv/backend
git pull origin main

# Install dependencies (if package.json changed)
npm ci --production

# Rebuild
npm run build

# Restart
pm2 restart hexacv-backend

# Check status
pm2 logs hexacv-backend
```

## Rollback

```bash
cd hexacv/backend
git log --oneline
git checkout [PREVIOUS-COMMIT-HASH]
npm run build
pm2 restart hexacv-backend
```
