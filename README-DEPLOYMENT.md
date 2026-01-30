# HexaCV Deployment Documentation

Welcome to the HexaCV deployment documentation. This guide provides comprehensive instructions for deploying your full-stack application to GitHub, AWS EC2, PostgreSQL RDS, and Vercel.

## Project Overview

HexaCV is a professional resume builder application with the following components:
- **Frontend**: React 19 application hosted on Vercel
- **Backend**: Node.js/Express API hosted on AWS EC2
- **Database**: PostgreSQL on AWS RDS
- **AI Services**: Gemini and Groq integration
- **Payment Processing**: Razorpay integration

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Frontend      │───▶│    Backend       │───▶│   PostgreSQL     │
│   (Vercel)      │    │    (AWS EC2)     │    │   (AWS RDS)      │
│                 │    │                  │    │                  │
│ React 19/Vite   │    │ Express/Node.js  │    │ Production DB    │
│ TypeScript      │    │ TypeScript       │    │ with Migrations  │
└─────────────────┘    └──────────────────┘    └──────────────────┘
                              │
                       ┌──────────────────┐
                       │   External APIs  │
                       │                  │
                       │ • Gemini AI      │
                       │ • Groq AI        │
                       │ • Razorpay       │
                       └──────────────────┘
```

## Deployment Steps

### 1. GitHub Repository Setup

First, ensure your code is properly pushed to GitHub:

```bash
# Navigate to project root
cd c:\Users\anand\OneDrive\Desktop\Mystartups\Hexacv

# Verify remote
git remote -v

# Push all changes
git add .
git commit -m "Deploy: Complete HexaCV application"
git push origin main
```

### 2. Frontend Deployment (Vercel)

#### Option A: Manual Setup
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository (`ANANDU-2000/hexacv`)
4. Configure the project settings:
   - Framework Preset: Other
   - Root Directory: `/`
   - Build Command: `node build.mjs`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### Option B: CLI Deployment
```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project root
cd c:\Users\anand\OneDrive\Desktop\Mystartups\Hexacv

# Deploy to Vercel
vercel --prod
```

#### Environment Variables for Vercel
Add these environment variables in Vercel dashboard:
```
NODE_ENV = production
VITE_API_URL = https://api.yourdomain.com  # Replace with your backend domain
```

### 3. Backend Deployment (AWS EC2)

#### Prerequisites
- AWS Account
- EC2 Instance (Ubuntu 22.04 LTS recommended)
- Security Group with ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3001 (Backend)

#### Automated Deployment
Run the deployment script on your local machine:

```powershell
# From project root
.\scripts\deploy-all.ps1
```

Or use the simplified push-and-deploy script:

```powershell
# From project root
.\push-and-deploy.ps1 "Deploy: HexaCV v1.0"
```

#### Manual EC2 Deployment
1. SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. Clone the repository:
```bash
git clone https://github.com/ANANDU-2000/hexacv.git
cd hexacv/backend
```

3. Run the automated deployment script:
```bash
bash deploy-ec2.sh
```

4. When prompted, configure your `.env` file with real values:
```bash
nano .env
```

5. After deployment, set up Nginx and SSL:
```bash
bash setup-nginx.sh
```

### 4. Database Setup (AWS RDS PostgreSQL)

#### Create PostgreSQL Instance
1. Go to AWS Console → RDS → Create Database
2. Choose PostgreSQL
3. Template: Free tier (for development) or Production
4. Settings:
   - DB instance identifier: `hexacv-db`
   - Master username: `postgres`
   - Master password: [Save securely]
5. Connectivity:
   - VPC: Default VPC
   - Public access: Yes (if EC2 and RDS are in different VPCs)
   - Existing VPC security group: Select the same security group as your EC2 instance
6. Additional configuration:
   - Initial database name: `hexacv`

#### Configure Security Groups
- Ensure your RDS security group allows connections from your EC2 instance's security group on port 5432

#### Get Connection String
- From RDS console, copy the endpoint
- Format: `postgresql://postgres:[PASSWORD]@hexacv-db.xxxxxx.region.rds.amazonaws.com:5432/hexacv`
- Update your `.env` file with this connection string

### 5. Environment Configuration

#### Backend .env File
```env
# Database (AWS RDS)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@hexacv-db.XXXXXX.region.rds.amazonaws.com:5432/hexacv

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

#### Frontend Environment Variables
For Vercel, set in the dashboard:
```env
VITE_API_URL=https://api.yourdomain.com
```

## Deployment Scripts

### Automated Deployment
We provide scripts to automate the deployment process:

1. **PowerShell Script** (`scripts/deploy-all.ps1`):
   - Checks prerequisites
   - Pushes to GitHub
   - Provides EC2 deployment instructions
   - Shows verification steps

2. **Batch Script** (`scripts/deploy-all.bat`):
   - Same functionality as PowerShell script for Windows CMD users

3. **Simple Push Script** (`push-and-deploy.ps1`):
   - Pushes code to GitHub
   - Triggers Vercel deployment
   - Provides EC2 backend deployment instructions

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
   cd ~/hexacv/backend
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

## Scripts Location

- `scripts/deploy-all.ps1` - Complete deployment automation for PowerShell
- `scripts/deploy-all.bat` - Complete deployment automation for Windows CMD
- `push-and-deploy.ps1` - Simple GitHub push with deployment instructions
- `backend/deploy-ec2.sh` - EC2 deployment script
- `backend/setup-nginx.sh` - Nginx and SSL setup script

## Security Best Practices

1. **Environment Variables**: Never commit sensitive data to git
2. **API Keys**: Store API keys securely and rotate regularly
3. **Passwords**: Use strong, unique passwords for all services
4. **SSH Keys**: Use SSH keys for EC2 access, not passwords
5. **Security Groups**: Restrict access to necessary IPs only
6. **SSL/TLS**: Always use HTTPS for production

## Support

For deployment issues or questions:
1. Check the logs on each platform
2. Review the deployment documentation
3. Contact AWS support for infrastructure issues
4. Reach out to Vercel support for frontend deployment issues
5. Consult the HexaCV community or development team

---

This deployment guide ensures your HexaCV application is properly deployed across all platforms with the necessary integrations and security measures in place.