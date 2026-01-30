# 🚀 QUICK START DEPLOYMENT GUIDE

## ✅ CODE PUSHED SUCCESSFULLY

Your code is now on GitHub: https://github.com/ANANDU-2000/HexaCV.git

## 🎯 NEXT STEPS:

### 1. DEPLOY FRONTEND TO VERCEL

**Option A: Using Vercel Dashboard (Easiest)**
1. Go to: https://vercel.com/dashboard
2. Click "Add New Project"
3. Import from Git Repository: `https://github.com/ANANDU-2000/HexaCV.git`
4. Set project name: `hexacv`
5. Add Environment Variables (copy from `VERCEL-ENV-VARIABLES.txt`):
   ```
   VITE_GEMINI_API_KEY = your_gemini_key
   VITE_GROQ_API_KEY = your_groq_key
   VITE_OPENAI_API_KEY = your_openai_key
   VITE_API_URL = https://api.hexacv.online
   ```
6. Click "Deploy"

**Option B: Using CLI**
```powershell
# Run the deployment script
.\deploy-vercel.ps1
```

### 2. GET YOUR API KEYS

**FREE OPTIONS (Start with these):**
- **Gemini**: https://aistudio.google.com/app/apikey
- **Groq**: https://console.groq.com/keys

**PAID OPTION (Optional backup):**
- **OpenAI**: https://platform.openai.com/api-keys

### 3. DEPLOY BACKEND TO AWS (After frontend works)

**AWS EC2 Setup:**
1. Launch Ubuntu 22.04 t3.medium instance
2. SSH into instance
3. Install Node.js, PM2, PostgreSQL
4. Clone your repo
5. Set up database
6. Deploy backend with PM2
7. Set up Nginx reverse proxy

**Detailed instructions in:**
- `AWS-DEPLOYMENT-GUIDE.md`
- `DEPLOYMENT-CHECKLIST.md`

## 📋 CHECKLIST

### Immediate (Today):
- [ ] Deploy frontend to Vercel
- [ ] Add API keys to Vercel environment variables
- [ ] Test frontend loads at your-vercel-url.vercel.app
- [ ] Test resume upload functionality

### This Week:
- [ ] Set up AWS EC2 instance
- [ ] Deploy backend API
- [ ] Update Vercel VITE_API_URL with backend URL
- [ ] Test full end-to-end functionality

### Soon:
- [ ] Buy custom domain
- [ ] Set up SSL certificate
- [ ] Configure monitoring
- [ ] Set up backups

## 🆘 TROUBLESHOOTING

**Frontend not loading:**
- Check browser console for errors
- Verify API keys in Vercel environment variables
- Ensure all VITE_ variables are set

**AI features not working:**
- Verify Gemini/Groq API keys are correct
- Check API key quotas/have not been exceeded
- Look at browser network tab for API errors

**Backend connection issues:**
- Check if backend is running
- Verify VITE_API_URL points to correct backend
- Check AWS security groups allow traffic

## 💰 COSTS

**Vercel (Frontend):** FREE
**AWS EC2 (Backend):** ~$42/month
**Domain:** ~$12-15/year

**Total:** ~$42/month after first year

## 📞 NEED HELP?

1. Check `DEPLOYMENT-CHECKLIST.md` for detailed steps
2. Review `AWS-DEPLOYMENT-GUIDE.md` for backend setup
3. Look at error logs in Vercel dashboard
4. Check browser developer tools console

---
**Your code is ready! Start with Vercel frontend deployment.**