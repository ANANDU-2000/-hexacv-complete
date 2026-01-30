# 🚀 VERCEL DEPLOYMENT COMPLETE GUIDE

## ✅ YOUR CODE IS NOW ON GITHUB
Repository: https://github.com/ANANDU-2000/hexacv

## 🎯 DEPLOY TO VERCEL - STEP BY STEP

### STEP 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Sign in with GitHub

### STEP 2: Import Your Project
1. Click "Add New Project"
2. Click "Continue" on the GitHub integration
3. Find and select "hexacv" repository
4. Click "Import"

### STEP 3: Configure Project Settings
- **Project Name**: hexacv (or any name you prefer)
- **Framework Preset**: Vite
- **Root Directory**: / (default)
- **Build Command**: `node build.mjs`
- **Output Directory**: `dist`

### STEP 4: ADD ENVIRONMENT VARIABLES
**⚠️ THIS IS CRITICAL - COPY THESE EXACTLY ⚠️**

Go to: Project Settings → Environment Variables

Add these variables:

```
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
VITE_GROQ_API_KEY=your_actual_groq_api_key_here
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
VITE_API_URL=https://api.hexacv.online
```

### STEP 5: GET YOUR API KEYS

**FREE OPTIONS (Start with these):**
1. **Gemini API Key** (Recommended - FREE):
   - URL: https://aistudio.google.com/app/apikey
   - Steps: Sign in with Google → Create API Key → Copy key

2. **Groq API Key** (Faster - FREE):
   - URL: https://console.groq.com/keys
   - Steps: Sign up/Login → Create API Key → Copy key

**PAID OPTION (Optional backup):**
3. **OpenAI API Key**:
   - URL: https://platform.openai.com/api-keys
   - Cost: ~$0.002/1K tokens

### STEP 6: Deploy
1. Click "Deploy" button
2. Wait for build to complete (2-3 minutes)
3. Your site will be live at: https://hexacv.vercel.app

### STEP 7: Test
1. Visit your deployed URL
2. Try uploading a resume
3. Test AI parsing with Gemini/Groq
4. Check that templates render correctly

## 🛠️ TROUBLESHOOTING

**If site shows blank page:**
- Check browser console (F12) for errors
- Verify all VITE_ environment variables are set
- Redeploy after fixing variables

**If AI features don't work:**
- Check API key quotas haven't been exceeded
- Verify API keys are correct (no extra spaces)
- Look at browser network tab for API errors

**If build fails:**
- Check Vercel build logs
- Ensure all dependencies install correctly
- Check for TypeScript/JavaScript errors

## 📋 AFTER VERCEL DEPLOYMENT

Once frontend works, proceed to:
1. Set up AWS EC2 for backend API
2. Update VITE_API_URL with your backend URL
3. Redeploy frontend

## 💰 COSTS

- **Vercel**: FREE (100GB bandwidth/month)
- **AWS EC2**: ~$42/month (t3.medium instance)
- **Domain**: ~$12-15/year (optional)

## 📞 SUPPORT

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console errors
3. Verify environment variables
4. Test API keys at their respective dashboards

---
**Ready to deploy! Start with Vercel using the steps above.**