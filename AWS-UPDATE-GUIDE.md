# AWS EC2 & RDS Update Guide

## 🚀 Quick Update Steps

### Step 1: Update Backend Code on EC2

#### Option A: Using SSH (Recommended)

1. **Open PowerShell or Terminal**

2. **SSH into your EC2 instance:**
   ```bash
   ssh -i "your-key.pem" ubuntu@your-ec2-ip-address
   ```
   
   **Find your EC2 IP:**
   - Go to AWS Console → EC2 → Instances
   - Copy the "Public IPv4 address"

3. **Navigate to project folder:**
   ```bash
   cd hexacv/backend
   ```

4. **Pull latest code from GitHub:**
   ```bash
   git pull origin main
   ```

5. **Install new dependencies (if any):**
   ```bash
   npm install
   ```

6. **Update environment variables (if needed):**
   ```bash
   nano .env
   ```
   
   Make sure these are set:
   ```bash
   OPENAI_API_KEY=your-openai-api-key-here
   GROQ_API_KEY=your_groq_key
   GEMINI_API_KEY=your_gemini_key
   DATABASE_URL=postgresql://postgres:Anandu2000@hexacv-db.cp2eoukoe7lq.eu-north-1.rds.amazonaws.com:5432/postgres
   ```

7. **Restart backend service:**
   
   **If using PM2:**
   ```bash
   pm2 restart all
   pm2 logs  # Check logs
   ```
   
   **If using systemd:**
   ```bash
   sudo systemctl restart hexacv-backend
   sudo systemctl status hexacv-backend  # Check status
   ```

8. **Verify backend is running:**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok"}
   ```

---

### Step 2: Update RDS Database (If Needed)

#### Run Database Migrations

1. **SSH into EC2** (same as above)

2. **Navigate to backend:**
   ```bash
   cd hexacv/backend
   ```

3. **Run migrations:**
   ```bash
   npm run migrate
   # Or manually:
   psql $DATABASE_URL -f database/migrations/011_ai_usage_logs.sql
   ```

#### Check Database Connection

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check tables
psql $DATABASE_URL -c "\dt"
```

---

## 📋 Detailed Step-by-Step (For Beginners)

### Part 1: Access EC2 Instance

1. **Open AWS Console:**
   - Go to: https://console.aws.amazon.com
   - Sign in

2. **Go to EC2 Dashboard:**
   - Click "Services" → "EC2"
   - Or click "EC2" from "Recently visited" (as shown in your screenshot)

3. **Find Your Instance:**
   - Click "Instances" in left menu
   - Find your instance (look for name like "hexacv-backend")
   - Copy the "Public IPv4 address" (e.g., `54.123.45.67`)

4. **Get Your Key File:**
   - You need the `.pem` file you downloaded when creating EC2
   - Usually named like `hexacv-key.pem` or `my-key.pem`
   - Save it somewhere safe (e.g., `C:\Users\anand\Downloads\`)

5. **SSH Connection:**
   
   **Windows (PowerShell):**
   ```powershell
   cd C:\Users\anand\Downloads
   ssh -i "hexacv-key.pem" ubuntu@YOUR-EC2-IP
   ```
   
   **Replace:**
   - `hexacv-key.pem` with your actual key file name
   - `YOUR-EC2-IP` with the IP you copied

6. **If SSH fails:**
   - Make sure Security Group allows SSH (port 22)
   - Check EC2 → Security Groups → Inbound rules

---

### Part 2: Update Backend Code

Once connected via SSH:

```bash
# 1. Go to project folder
cd hexacv/backend

# 2. Check current status
git status

# 3. Pull latest code
git pull origin main

# 4. Install dependencies (if package.json changed)
npm install

# 5. Check if .env has OpenAI key
cat .env | grep OPENAI_API_KEY

# 6. If missing, edit .env file
nano .env
# Press Ctrl+X, then Y, then Enter to save

# 7. Restart backend
pm2 restart all

# 8. Check if it's running
pm2 status
pm2 logs --lines 50
```

---

### Part 3: Access RDS Database

1. **Go to RDS Dashboard:**
   - AWS Console → "Services" → "RDS"
   - Or click "Aurora and RDS" from "Recently visited"

2. **Find Your Database:**
   - Click "Databases" in left menu
   - Find `hexacv-db` (or your database name)
   - Copy the "Endpoint" (e.g., `hexacv-db.cp2eoukoe7lq.eu-north-1.rds.amazonaws.com`)

3. **Connect from EC2:**
   
   ```bash
   # From EC2 instance (already SSH'd in)
   psql postgresql://postgres:Anandu2000@hexacv-db.cp2eoukoe7lq.eu-north-1.rds.amazonaws.com:5432/postgres
   ```

4. **Run SQL Commands:**
   ```sql
   -- Check version
   SELECT version();
   
   -- List tables
   \dt
   
   -- Check ai_usage_logs table exists
   SELECT * FROM ai_usage_logs LIMIT 5;
   
   -- Exit
   \q
   ```

---

## 🔧 Troubleshooting

### Backend Not Starting?

```bash
# Check PM2 logs
pm2 logs

# Check if port 3001 is in use
sudo lsof -i :3001

# Kill process if needed
pm2 delete all
pm2 start npm --name "hexacv-backend" -- start
```

### Database Connection Failed?

1. **Check Security Group:**
   - EC2 Security Group must allow outbound to RDS
   - RDS Security Group must allow inbound from EC2 Security Group

2. **Check Database URL:**
   ```bash
   echo $DATABASE_URL
   # Should show: postgresql://postgres:password@endpoint:5432/postgres
   ```

3. **Test Connection:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

### Can't SSH into EC2?

1. **Check Security Group:**
   - EC2 → Security Groups → Inbound rules
   - Must have SSH (port 22) from your IP

2. **Check Key File Permissions (Linux/Mac):**
   ```bash
   chmod 400 hexacv-key.pem
   ```

3. **Use AWS Systems Manager (Alternative):**
   - EC2 → Instances → Select instance → "Connect"
   - Use "Session Manager" (no SSH key needed)

---

## 📝 Quick Reference

### EC2 Instance Info:
- **Region:** eu-north-1 (Stockholm) - as shown in your screenshot
- **Service:** EC2
- **Access:** SSH with .pem key file

### RDS Database Info:
- **Region:** eu-north-1 (Stockholm)
- **Service:** RDS
- **Endpoint:** `hexacv-db.cp2eoukoe7lq.eu-north-1.rds.amazonaws.com`
- **Port:** 5432
- **Database:** postgres
- **Username:** postgres
- **Password:** Anandu2000

### Update Command Summary:
```bash
# 1. SSH into EC2
ssh -i "key.pem" ubuntu@EC2-IP

# 2. Update code
cd hexacv/backend
git pull origin main
npm install

# 3. Update .env if needed
nano .env

# 4. Restart
pm2 restart all

# 5. Verify
curl http://localhost:3001/health
```

---

## ✅ Verification Checklist

After updating:

- [ ] Backend responds: `curl https://api.hexacv.online/health`
- [ ] PM2 shows backend running: `pm2 status`
- [ ] Database connection works: `psql $DATABASE_URL -c "SELECT 1;"`
- [ ] OpenAI API key is set: `cat .env | grep OPENAI`
- [ ] Frontend can connect to backend (test on website)

---

**Need Help?** Check logs:
- Backend logs: `pm2 logs`
- System logs: `sudo journalctl -u hexacv-backend -n 50`
