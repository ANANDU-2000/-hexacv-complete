# Complete Deployment Guide for HexaCV Project

This guide covers the complete deployment process for HexaCV to GitHub, AWS EC2, PostgreSQL RDS, and Vercel.

## Table of Contents
1. [GitHub Repository Setup](#github-repository-setup)
2. [Frontend Deployment to Vercel](#frontend-deployment-to-vercel)
3. [Backend Deployment to AWS EC2](#backend-deployment-to-aws-ec2)
4. [Database Setup on AWS RDS PostgreSQL](#database-setup-on-aws-rds-postgresql)
5. [Complete Integration](#complete-integration)
6. [Deployment Automation Script](#deployment-automation-script)

## GitHub Repository Setup

### 1. Initialize GitHub Repository
```bash
# Navigate to your project root
cd c:\Users\anand\OneDrive\Desktop\Mystartups\Hexacv

# Ensure you have the correct remote URL
git remote set-url origin https://github.com/ANANDU-2000/hexacv.git

# Add all changes
git add .

# Commit changes
git commit -m "Deploy: Complete project setup for GitHub, AWS EC2, PostgreSQL RDS, and Vercel"

# Push to GitHub
git push origin main
```

### 2. Verify GitHub Repository
- Ensure all files are pushed to the GitHub repository
- Verify that GitHub Actions are configured if you're using them
- Check that the repository is properly set up for Vercel integration

## Frontend Deployment to Vercel

### 1. Vercel Project Setup
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository (`ANANDU-2000/hexacv`)
4. Configure the project settings:
   - Framework Preset: Other
   - Root Directory: `/` (root of the monorepo)
   - Build Command: `node build.mjs`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2. Environment Variables for Vercel
In Vercel dashboard, go to your project settings → Environment Variables and add:
```
NODE_ENV = production
VITE_API_URL = https://api.yourdomain.com  # Replace with your backend domain
```

### 3. Domain Configuration for Vercel
- Add your custom domain (e.g., `hexacv.online`) in Vercel project settings
- Configure DNS settings as per Vercel's instructions
- Wait for DNS propagation and SSL certificate generation

## Backend Deployment to AWS EC2

### 1. EC2 Instance Setup
1. Launch an Ubuntu 22.04 LTS instance on AWS EC2
2. Configure security groups:
   - Port 22 (SSH) from your IP
   - Port 80 (HTTP) from 0.0.0.0/0
   - Port 443 (HTTPS) from 0.0.0.0/0
   - Port 3001 (Backend) from 0.0.0.0/0 (or restrict to your frontend domain)

### 2. SSH into EC2 Instance
```bash
# SSH into your EC2 instance
ssh -i your-key-pair.pem ubuntu@your-ec2-public-ip
```

### 3. Automated Deployment Script
Run the automated deployment script:

```bash
# Download and run the deployment script
curl -o deploy-ec2.sh https://raw.githubusercontent.com/ANANDU-2000/hexacv/main/backend/deploy-ec2.sh
chmod +x deploy-ec2.sh
bash deploy-ec2.sh
```

### 4. Manual Environment Configuration
After the script pauses, edit the `.env` file with your actual values:

```bash
nano hexacv/backend/.env
```

Replace placeholder values:
```env
# Database (AWS RDS - Get from AWS RDS Console)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@your-rds-endpoint.region.rds.amazonaws.com:5432/hexacv

# AI Services (CRITICAL - KEEP SECRET)
GROQ_API_KEY=your_actual_groq_api_key_here
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Payment (Razorpay - Use live keys in production)
RAZORPAY_KEY_ID=your_live_razorpay_key_id
RAZORPAY_KEY_SECRET=your_live_razorpay_secret

# Admin
ADMIN_PASSWORD=your_strong_admin_password_here

# Session (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=your_generated_32_byte_hex_string_here

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com  # Your Vercel domain
```

### 5. Nginx and SSL Setup
After the backend deployment, set up Nginx and SSL:

```bash
# Download and run the Nginx setup script
curl -o setup-nginx.sh https://raw.githubusercontent.com/ANANDU-2000/hexacv/main/backend/setup-nginx.sh
chmod +x setup-nginx.sh
bash setup-nginx.sh
```

## Database Setup on AWS RDS PostgreSQL

### 1. Create PostgreSQL RDS Instance
1. Go to AWS Console → RDS → Create Database
2. Choose PostgreSQL
3. Template: Free tier (for development) or Production
4. Settings:
   - DB instance identifier: `hexacv-db`
   - Master username: `postgres`
   - Master password: [Save securely]
5. Connectivity:
   - VPC: Default VPC
   - Public access: Yes (if EC2 and RDS are in different VPCs, or set up VPC peering)
   - Existing VPC security group: Select the same security group as your EC2 instance
6. Additional configuration:
   - Initial database name: `hexacv`

### 2. Configure Security Groups
- Ensure your RDS security group allows connections from your EC2 instance's security group on port 5432

### 3. Get Connection String
- From RDS console, copy the endpoint
- Format: `postgresql://postgres:[PASSWORD]@hexacv-db.xxxxxx.region.rds.amazonaws.com:5432/hexacv`
- Update your `.env` file with this connection string

## Complete Integration

### 1. API Gateway Configuration
- Backend runs on EC2 with Nginx reverse proxy
- Domain: `https://api.yourdomain.com`
- Health check: `https://api.yourdomain.com/health`

### 2. Frontend Configuration
- Frontend deployed on Vercel
- Domain: `https://yourdomain.com`
- Environment variable: `VITE_API_URL=https://api.yourdomain.com`

### 3. Cross-Origin Resource Sharing (CORS)
The backend is configured to allow your frontend domain:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',           // Development
    'https://yourdomain.com',          // Production domain
    'https://yourdomain.vercel.app',   // Vercel preview domain
    /.*\.vercel\.app$/                 // All Vercel preview domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Deployment Automation Script

### GitHub to All Platforms Deployment Script
Create a PowerShell script to automate deployments:

```powershell
# deploy-all-platforms.ps1
param(
    [Parameter(Mandatory=$false)]
    [string]$Message = "Deploy: Latest updates - GitHub, AWS EC2, PostgreSQL RDS, Vercel"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Complete HexaCV Deployment Script" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# 1. Push to GitHub (triggers Vercel auto-deploy)
Write-Host "`n1. 📦 Pushing to GitHub..." -ForegroundColor Yellow
git add .
git commit -m $Message -m "Trigger Vercel deployment"
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ GitHub push failed!" -ForegroundColor Red
    exit $LASTEXITCODE
} else {
    Write-Host "✅ GitHub deployment triggered" -ForegroundColor Green
}

# 2. Deploy to AWS EC2 (Backend)
Write-Host "`n2. ☁️  Preparing EC2 backend deployment..." -ForegroundColor Yellow

# Instructions for EC2 deployment
Write-Host "To deploy to EC2:" -ForegroundColor Cyan
Write-Host "   a) SSH to your EC2 instance" -ForegroundColor White
Write-Host "   b) Navigate to the project: cd hexacv/backend" -ForegroundColor White
Write-Host "   c) Pull latest changes: git pull origin main" -ForegroundColor White
Write-Host "   d) Install dependencies: npm ci --production" -ForegroundColor White
Write-Host "   e) Build: npm run build" -ForegroundColor White
Write-Host "   f) Restart PM2: pm2 restart hexacv-backend" -ForegroundColor White
Write-Host "   g) Check status: pm2 status" -ForegroundColor White

# 3. PostgreSQL Migration
Write-Host "`n3. 🗄️  Database Migration (Run on EC2):" -ForegroundColor Yellow
Write-Host "   After EC2 deployment, run: npm run migrate" -ForegroundColor White

# 4. Verification Steps
Write-Host "`n4. ✅ Verification Commands:" -ForegroundColor Yellow
Write-Host "   Backend Health: curl https://api.yourdomain.com/health" -ForegroundColor White
Write-Host "   Frontend: Visit https://yourdomain.com" -ForegroundColor White
Write-Host "   PM2 Status: pm2 status" -ForegroundColor White

Write-Host "`n✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host "   GitHub: https://github.com/ANANDU-2000/hexacv" -ForegroundColor White
Write-Host "   Vercel: https://yourdomain.com" -ForegroundColor White
Write-Host "   Backend: https://api.yourdomain.com" -ForegroundColor White
Write-Host "   DB: AWS RDS PostgreSQL" -ForegroundColor White
```

### Automated Deployment Process
1. Run the script to push to GitHub (which triggers Vercel)
2. Manually deploy to EC2 using the instructions provided
3. Monitor all deployments and verify functionality

## Post-Deployment Verification

### 1. Frontend (Vercel)
- Visit your domain and ensure the site loads
- Check browser console for any errors
- Verify API calls are working (network tab)

### 2. Backend (AWS EC2)
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs hexacv-backend

# Health check
curl https://api.yourdomain.com/health
```

### 3. Database (AWS RDS)
- Verify connectivity from EC2 to RDS
- Check that migrations ran successfully
- Confirm tables were created

### 4. Integrated Functionality
- Test API endpoints from frontend
- Verify payment functionality (Razorpay)
- Test AI features (Gemini/Groq)
- Confirm all integrations work as expected

## Maintenance and Updates

### Regular Updates Process
1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub (this triggers Vercel)
4. Deploy backend to EC2:
   ```bash
   # On EC2 instance
   cd hexacv/backend
   git pull origin main
   npm ci --production
   npm run build
   npm run migrate  # If there are DB changes
   pm2 restart hexacv-backend
   ```

### Monitoring
- Set up CloudWatch alarms for EC2 and RDS
- Monitor Vercel analytics
- Check PM2 logs regularly
- Monitor database performance

## Troubleshooting

### Common Issues
1. **CORS Errors**: Verify frontend URL in backend CORS configuration
2. **Database Connection**: Check RDS security groups and connection string
3. **API Not Responding**: Check EC2 firewall settings and Nginx configuration
4. **SSL Certificate**: Verify domain DNS settings and certificate status

### Recovery Steps
1. Check logs on all platforms
2. Verify environment variables are set correctly
3. Test connectivity between components
4. Roll back if necessary using Git commits