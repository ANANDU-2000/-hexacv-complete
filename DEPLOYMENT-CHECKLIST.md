# DEPLOYMENT CHECKLIST

## ✅ PHASE 1: GitHub Repository Setup

1. [ ] Create new GitHub repository named `hexaresume`
2. [ ] Run `setup-new-github.ps1` script:
   ```powershell
   .\setup-new-github.ps1
   ```
3. [ ] Verify code is pushed:
   ```bash
   git log --oneline -3
   ```

## ✅ PHASE 2: Vercel Frontend Deployment

1. [ ] Go to https://vercel.com/dashboard
2. [ ] Remove old HexaCV project (if exists)
3. [ ] Click "Add New Project"
4. [ ] Import from Git Repository: `https://github.com/ANANDU-2000/hexaresume`
5. [ ] Set project name: `hexaresume`
6. [ ] Add Environment Variables (in Vercel Dashboard):
   ```
   VITE_GEMINI_API_KEY = your_gemini_api_key
   VITE_GROQ_API_KEY = your_groq_api_key
   VITE_OPENAI_API_KEY = your_openai_api_key
   VITE_API_URL = https://api.hexacv.online  # (temporary, change after backend)
   ```
7. [ ] Click "Deploy"
8. [ ] Test frontend: https://hexaresume.vercel.app

## ✅ PHASE 3: Backend API Deployment (AWS EC2)

### Option A: AWS EC2 (Recommended)

1. [ ] Launch EC2 instance (Ubuntu 22.04, t3.medium)
2. [ ] SSH into instance
3. [ ] Install Node.js, PM2, PostgreSQL
4. [ ] Clone repository
5. [ ] Set up database:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE hexacv;
   CREATE USER hexacv_admin WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE hexacv TO hexacv_admin;
   \q
   ```
6. [ ] Create backend `.env` file:
   ```bash
   cd backend
   nano .env
   ```
7. [ ] Install dependencies and run:
   ```bash
   npm install
   npm run build
   npm run migrate
   pm2 start dist/server.js --name hexacv-api
   pm2 startup
   pm2 save
   ```
8. [ ] Set up Nginx reverse proxy
9. [ ] Update Vercel VITE_API_URL:
   ```
   VITE_API_URL = http://your-ec2-public-ip:3001
   # Or with domain: https://api.yourdomain.com
   ```

### Option B: Vercel Serverless (Simpler)

1. [ ] Create separate Vercel project for backend
2. [ ] Set all backend environment variables in Vercel
3. [ ] Deploy backend
4. [ ] Update frontend VITE_API_URL to backend project URL

## ✅ PHASE 4: Domain Configuration (Optional)

### With AWS EC2 + Domain:
1. [ ] Buy domain from Namecheap/Gandi/AWS Route 53
2. [ ] Point domain DNS to EC2 public IP
3. [ ] Set up SSL certificate with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
4. [ ] Update Vercel VITE_API_URL to use your domain

### With Vercel:
1. [ ] Add domain in Vercel Dashboard
2. [ ] Update DNS records as instructed
3. [ ] Vercel handles SSL automatically

## ✅ PHASE 5: Testing & Validation

1. [ ] Test frontend loads: https://hexaresume.vercel.app
2. [ ] Test API endpoints:
   ```bash
   curl http://your-backend-url/health
   ```
3. [ ] Test resume upload functionality
4. [ ] Test AI parsing with Gemini/Groq
5. [ ] Test template rendering
6. [ ] Test PDF generation
7. [ ] Test mobile responsiveness

## ✅ PHASE 6: Monitoring & Maintenance

1. [ ] Set up uptime monitoring (UptimeRobot)
2. [ ] Set up error tracking (Sentry)
3. [ ] Configure database backups
4. [ ] Set up log rotation
5. [ ] Monitor resource usage (CPU, memory, disk)

## 🔧 TROUBLESHOOTING

### Frontend Issues:
- **Blank page**: Check browser console for errors
- **API calls failing**: Verify VITE_API_URL in Vercel
- **AI not working**: Check API keys in Vercel environment variables

### Backend Issues:
- **API not responding**: Check PM2 status `pm2 status`
- **Database errors**: Check PostgreSQL logs
- **502 errors**: Check Nginx configuration

### Deployment Issues:
- **Build fails**: Check Vercel build logs
- **Git push fails**: Verify GitHub credentials
- **Permission denied**: Check file permissions

## 📋 API KEY SOURCES

1. **Gemini API Key** (FREE):
   - URL: https://aistudio.google.com/app/apikey
   - Limits: 60 requests/minute

2. **Groq API Key** (FREE):
   - URL: https://console.groq.com/keys
   - Limits: 30 requests/minute, faster than Gemini

3. **OpenAI API Key** (PAID):
   - URL: https://platform.openai.com/api-keys
   - Costs: ~$0.002/1K tokens

## 💰 COST ESTIMATION

### Vercel (Frontend):
- Free tier: 100GB bandwidth, 100 builds/month
- Cost: $0/month

### AWS EC2 (Backend):
- t3.medium: ~$35/month
- Storage: ~$2/month
- Data transfer: ~$5/month
- **Total**: ~$42/month

### Domain:
- .com domain: ~$12-15/year

### **Total Monthly Cost**: ~$42/month

## 🚀 POST-DEPLOYMENT

1. [ ] Set up analytics (Google Analytics)
2. [ ] Configure SEO (sitemap, robots.txt)
3. [ ] Set up email notifications
4. [ ] Create user documentation
5. [ ] Plan for scaling (load balancer, CDN)
6. [ ] Set up automated backups
7. [ ] Configure security headers
8. [ ] Set up CI/CD pipeline

## 📞 SUPPORT

If you encounter issues:
1. Check the logs in Vercel/PM2
2. Refer to AWS-DEPLOYMENT-GUIDE.md
3. Check GitHub Actions for deployment errors
4. Review error messages in browser console