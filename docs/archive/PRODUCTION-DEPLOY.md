# PRODUCTION DEPLOYMENT STEPS

**Domain:** hexacv.online  
**Frontend:** Vercel  
**Backend:** AWS EC2  
**Database:** AWS RDS PostgreSQL

---

## STEP 1: FRONTEND DEPLOYMENT (VERCEL)

### 1.1 Login to Vercel
```bash
npm i -g vercel
vercel login
```

### 1.2 Link Project to Vercel
```bash
cd "c:\Users\ACER\Downloads\BuildMyResume6\BuildMyResume6"
vercel link
# Select: Link to existing project
# Project: hexacv (or create new)
```

### 1.3 Configure Environment Variables

**Vercel Dashboard → Settings → Environment Variables:**
```bash
VITE_API_URL=https://api.hexacv.online
```

### 1.4 Deploy to Production
```bash
# Deploy to production
vercel --prod

# Or from Vercel dashboard:
# Settings → Git → Connect GitHub repo
# Auto-deploy on push to main branch
```

### 1.5 Configure Custom Domain
**Vercel Dashboard → Domains:**
1. Add domain: `hexacv.online`
2. Add DNS records at your registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel IP)

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
3. Wait for DNS propagation (5-30 minutes)
4. Vercel auto-provisions SSL certificate

---

## STEP 2: AWS RDS POSTGRESQL SETUP

### 2.1 Create RDS Instance
**AWS Console → RDS → Create Database:**
- Engine: PostgreSQL 15.x
- Template: Free tier (or Production)
- DB instance identifier: `hexacv-db`
- Master username: `postgres`
- Master password: `[SAVE SECURELY]`
- DB instance class: db.t3.micro (free tier)
- Storage: 20 GB
- VPC: Default
- Public access: **No** (only EC2 can access)
- VPC security group: Create new → `hexacv-db-sg`
- Database name: `hexacv`

### 2.2 Configure Security Group
**EC2 → Security Groups → hexacv-db-sg → Inbound Rules:**
```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: [EC2 security group ID]
Description: Allow EC2 backend access
```

### 2.3 Get Connection String
**RDS → Databases → hexacv-db → Connectivity:**
```
Endpoint: hexacv-db.xxxxxxxxxx.us-east-1.rds.amazonaws.com
Port: 5432

Connection string format:
postgresql://postgres:[PASSWORD]@hexacv-db.xxxxxxxxxx.us-east-1.rds.amazonaws.com:5432/hexacv
```

### 2.4 Test Connection (from EC2)
```bash
# Install PostgreSQL client on EC2
sudo apt install postgresql-client

# Test connection
psql "postgresql://postgres:[PASSWORD]@hexacv-db.xxxx.rds.amazonaws.com:5432/hexacv"
```

---

## STEP 3: AWS EC2 BACKEND DEPLOYMENT

### 3.1 Launch EC2 Instance
**AWS Console → EC2 → Launch Instance:**
- Name: `hexacv-backend`
- AMI: Ubuntu 22.04 LTS
- Instance type: t2.micro (free tier) or t3.small (production)
- Key pair: Create new → Download `.pem` file
- Security group: Create new → `hexacv-backend-sg`
  - Inbound rules:
    ```
    SSH (22) from My IP
    Custom TCP (3001) from 0.0.0.0/0
    HTTPS (443) from 0.0.0.0/0
    ```
- Storage: 20 GB
- Launch instance

### 3.2 Connect to EC2
```bash
# Save .pem file
mv ~/Downloads/hexacv-backend.pem ~/.ssh/
chmod 400 ~/.ssh/hexacv-backend.pem

# SSH into EC2
ssh -i ~/.ssh/hexacv-backend.pem ubuntu@[EC2-PUBLIC-IP]
```

### 3.3 Install Dependencies on EC2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v  # Should show v18.x
npm -v

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### 3.4 Clone Repository on EC2
```bash
# Clone repo
git clone https://github.com/ANANDU-2000/hexacv.git
cd hexacv/backend

# Install dependencies
npm ci --production
```

### 3.5 Configure Backend Environment
```bash
# Create .env file
nano .env
```

**Paste this configuration:**
```bash
# Database (from RDS)
DATABASE_URL=postgresql://postgres:[PASSWORD]@hexacv-db.xxxxxxxxxx.us-east-1.rds.amazonaws.com:5432/hexacv

# AI Services (CRITICAL - KEEP SECRET)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# Payment
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Admin
ADMIN_PASSWORD=strong_random_password_here

# Session (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=your_random_32_byte_hex_string

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://hexacv.online
```

**Save:** Ctrl+O, Enter, Ctrl+X

### 3.6 Run Database Migration
```bash
npm run migrate
```

**Expected output:**
```
✓ Tables created
✓ Indexes created
✓ Migration complete
```

### 3.7 Build Backend
```bash
npm run build
```

### 3.8 Start Backend with PM2
```bash
# Start backend
pm2 start dist/server.js --name hexacv-backend

# Setup auto-restart on reboot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# Check status
pm2 status

# View logs
pm2 logs hexacv-backend
```

---

## STEP 4: CONFIGURE DOMAIN FOR BACKEND

### Option A: Using Nginx Reverse Proxy (Recommended)

#### 4.1 Install Nginx
```bash
sudo apt install nginx -y
```

#### 4.2 Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/hexacv-backend
```

**Paste this configuration:**
```nginx
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
    }
}
```

**Save:** Ctrl+O, Enter, Ctrl+X

#### 4.3 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/hexacv-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4.4 Install SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.hexacv.online

# Follow prompts, choose option 2 (redirect HTTP to HTTPS)
```

**Certbot auto-renews certificate every 90 days**

### Option B: Direct EC2 Public IP (Not Recommended)

**DNS Configuration:**
```
Type: A
Name: api
Value: [EC2-PUBLIC-IP]
```

**Update Vercel env:**
```
VITE_API_URL=http://[EC2-PUBLIC-IP]:3001
```

---

## STEP 5: DNS CONFIGURATION

**At Your Domain Registrar (GoDaddy/Namecheap/Cloudflare):**

### Frontend (Vercel)
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Backend (EC2 + Nginx)
```
Type: A
Name: api
Value: [EC2-PUBLIC-IP]
TTL: 3600
```

**Wait 5-30 minutes for DNS propagation**

---

## STEP 6: VERIFY DEPLOYMENT

### 6.1 Test Backend Health
```bash
curl https://api.hexacv.online/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 6.2 Test Frontend
```
https://hexacv.online
# Should load without errors
```

### 6.3 Test AI Rewrite Endpoint
```bash
curl -X POST https://api.hexacv.online/api/ai-rewrite/bullet \
  -H "Content-Type: application/json" \
  -d '{"bullet":"Built a system","role":"Software Engineer"}'
```

### 6.4 Test End-to-End Flow
1. Visit https://hexacv.online
2. Create resume
3. Select free template
4. Download PDF ✓
5. Select paid template (₹49)
6. Verify AI rewrite applied
7. Download PDF ✓

---

## STEP 7: POST-DEPLOYMENT TASKS

### 7.1 Setup Monitoring
```bash
# Install monitoring tool on EC2
npm install -g pm2

# Enable monitoring dashboard
pm2 plus
```

### 7.2 Setup Uptime Monitoring
- **UptimeRobot:** Monitor `https://api.hexacv.online/health` every 5 minutes
- **Vercel Analytics:** Enable in Vercel dashboard

### 7.3 Setup Error Tracking
- Install Sentry or similar service
- Add to frontend and backend

### 7.4 Backup Database
```bash
# Setup daily backup cron job on EC2
crontab -e

# Add this line (backup at 2 AM daily):
0 2 * * * pg_dump "postgresql://postgres:[PASSWORD]@hexacv-db.xxxx.rds.amazonaws.com:5432/hexacv" > /home/ubuntu/backups/hexacv_$(date +\%Y\%m\%d).sql
```

---

## STEP 8: FUTURE DEPLOYMENTS

### Update Frontend (Vercel)
```bash
# Commit changes
git add .
git commit -m "Update: description"
git push origin main

# Vercel auto-deploys on push
# Or manually:
vercel --prod
```

### Update Backend (EC2)
```bash
# SSH into EC2
ssh -i ~/.ssh/hexacv-backend.pem ubuntu@[EC2-PUBLIC-IP]

# Pull latest code
cd hexacv/backend
git pull origin main

# Install new dependencies (if any)
npm ci --production

# Rebuild
npm run build

# Restart backend
pm2 restart hexacv-backend

# View logs
pm2 logs hexacv-backend
```

---

## TROUBLESHOOTING

### Frontend Not Loading
```bash
# Check Vercel deployment logs
vercel logs

# Check DNS propagation
nslookup hexacv.online

# Check SSL certificate
curl -I https://hexacv.online
```

### Backend Not Responding
```bash
# SSH into EC2
ssh -i ~/.ssh/hexacv-backend.pem ubuntu@[EC2-PUBLIC-IP]

# Check PM2 status
pm2 status

# Check logs
pm2 logs hexacv-backend --lines 100

# Restart backend
pm2 restart hexacv-backend

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

### Database Connection Failed
```bash
# Test connection from EC2
psql "postgresql://postgres:[PASSWORD]@hexacv-db.xxxx.rds.amazonaws.com:5432/hexacv"

# Check security group allows EC2 → RDS on port 5432
# Check DATABASE_URL in backend .env
```

### SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## ROLLBACK PROCEDURE

### Rollback Frontend
```bash
vercel rollback
```

### Rollback Backend
```bash
# SSH into EC2
cd hexacv/backend

# Revert to previous commit
git log --oneline  # Find previous commit hash
git checkout [PREVIOUS-COMMIT-HASH]

# Rebuild and restart
npm run build
pm2 restart hexacv-backend
```

### Rollback Database
```bash
# Restore from backup
psql "postgresql://postgres:[PASSWORD]@hexacv-db.xxxx.rds.amazonaws.com:5432/hexacv" < /home/ubuntu/backups/hexacv_YYYYMMDD.sql
```

---

## FINAL CHECKLIST

- [ ] Vercel connected to GitHub
- [ ] Frontend deployed to hexacv.online
- [ ] Backend running on EC2 with PM2
- [ ] Database migrated on RDS
- [ ] SSL certificates active (frontend + backend)
- [ ] Environment variables configured
- [ ] DNS records propagated
- [ ] Health check passing
- [ ] End-to-end flow tested
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Error tracking setup

**When all checked: Production deployment complete ✅**
