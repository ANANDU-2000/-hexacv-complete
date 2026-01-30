# 🚀 Simple AWS Update Guide

## Step-by-Step Instructions

### Step 1: Get EC2 IP Address

1. Go to AWS Console: https://console.aws.amazon.com
2. Click **"EC2"** (from Recently visited in your screenshot)
3. Click **"Instances"** (left menu)
4. Find your instance → Copy **"Public IPv4 address"**
   - Example: `54.123.45.67`

---

### Step 2: Connect to EC2

**Option A: Using PowerShell (Windows)**

1. Open PowerShell
2. Navigate to where your `.pem` key file is:
   ```powershell
   cd C:\Users\anand\Downloads
   ```
   (Replace with actual location of your key file)

3. Connect:
   ```powershell
   ssh -i "your-key-file.pem" ubuntu@YOUR-EC2-IP
   ```
   
   Replace:
   - `your-key-file.pem` = your actual key file name
   - `YOUR-EC2-IP` = IP address from Step 1

**Option B: Using AWS Console (Easier - No Key File)**

1. In EC2 Dashboard → Select your instance
2. Click **"Connect"** button (top right)
3. Choose **"Session Manager"** tab
4. Click **"Connect"**
5. Browser-based terminal opens (no SSH key needed!)

---

### Step 3: Update Backend Code

Once connected, run these commands:

```bash
# 1. Go to backend folder
cd hexacv/backend

# 2. Pull latest code from GitHub
git pull origin main

# 3. Install any new packages
npm install

# 4. Check if OpenAI key is set
cat .env | grep OPENAI_API_KEY

# 5. If not set, edit .env file
nano .env
# Add this line:
# OPENAI_API_KEY=your-openai-api-key-here
# Press Ctrl+X, then Y, then Enter to save

# 6. Restart backend
pm2 restart all

# 7. Check if running
pm2 status
```

---

### Step 4: Verify It Works

```bash
# Test backend
curl http://localhost:3001/health

# Should return: {"status":"ok"}

# Check logs
pm2 logs --lines 20
```

---

### Step 5: Update Database (If Needed)

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Run migrations (if any new SQL files)
cd database/migrations
psql $DATABASE_URL -f 011_ai_usage_logs.sql
```

---

## 🎯 Quick Copy-Paste Commands

**Copy all these at once:**

```bash
cd hexacv/backend
git pull origin main
npm install
pm2 restart all
pm2 logs --lines 20
```

---

## ❓ Common Issues

### "Permission denied" when SSH?
- Make sure you're using the correct `.pem` key file
- Try AWS Session Manager instead (no key needed)

### "git pull" fails?
- Check: `git remote -v` (should show GitHub URL)
- If wrong: `git remote set-url origin https://github.com/ANANDU-2000/-hexacv-complete.git`

### Backend not starting?
- Check logs: `pm2 logs`
- Check if port 3001 is free: `sudo lsof -i :3001`

### Database connection fails?
- Check `.env` file has correct `DATABASE_URL`
- Format: `postgresql://postgres:password@endpoint:5432/postgres`

---

## ✅ Done!

After these steps:
- ✅ Backend code updated
- ✅ Backend restarted
- ✅ Database updated (if needed)

Test your website: https://hexacv.online

---

## 📞 Need Help?

Check these files:
- `AWS-UPDATE-GUIDE.md` - Detailed guide
- `UPDATE-AWS-EC2-AND-DATABASE.sh` - Automated script
