# Deployment Instructions

## ✅ All Code Changes Complete

### What Was Fixed:
1. ✅ Paid template now uses **OpenAI GPT-4o-mini** (premium quality)
2. ✅ Added **Role Analysis Panel** component
3. ✅ Improved **payment error handling** with retries
4. ✅ Increased **summary limit** to 3000 characters
5. ✅ Added **keyword highlighting** and **auto-correction**
6. ✅ Fixed **mobile viewport** issues
7. ✅ Improved **Template2** page breaks and styling

### Files Changed:
- `backend/src/routes/ai-rewrite.ts` - Now uses OpenAI for paid template
- `backend/.env` - Added OPENAI_API_KEY
- `src/components/RoleAnalysisPanel.tsx` - New component
- `src/components/KeywordHighlightDisplay.tsx` - New component
- `src/utils/autoCorrector.ts` - New utility
- `src/utils/keywordHighlighter.ts` - New utility
- `src/api-service.ts` - Improved payment error handling
- `src/components/Step2Editor.tsx` - Added role analysis and keyword highlighting
- `src/components/Step2Templates.tsx` - Improved error messages
- `src/services/validationService.ts` - Increased summary limit
- `public/templates/template2.html` - Improved page breaks
- And many more...

---

## 🚀 To Push and Deploy:

### Step 1: Close Cursor/VS Code
Close all editors to release git lock file.

### Step 2: Push to GitHub
Open PowerShell in project folder and run:

```powershell
# Remove lock file if exists
Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue

# Add all changes
git add -A

# Commit
git commit -m "Fix: Switch paid template to OpenAI GPT-4o-mini, add role analysis panel, improve payment error handling, increase summary limit to 3000 chars, add keyword highlighting and auto-correction"

# Push
git push origin main
```

**Note:** If asked for password, use your **GitHub Personal Access Token** (not account password).
Get token from: https://github.com/settings/tokens (scope: `repo`)

### Step 3: Vercel Auto-Deploy
Vercel is connected to GitHub and will **automatically redeploy** when you push to `main` branch.

Check deployment status at: https://vercel.com/dashboard

---

## 🔧 Backend Deployment (AWS EC2)

After pushing, update backend on EC2:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to project
cd hexacv/backend

# Pull latest changes
git pull origin main

# Restart backend
pm2 restart all

# Or if using systemd:
sudo systemctl restart hexacv-backend
```

---

## ✅ Verify Deployment

1. **Frontend (Vercel):**
   - Check: https://hexacv.online (or your Vercel URL)
   - Should auto-deploy in 2-3 minutes after push

2. **Backend (EC2):**
   - Check: https://api.hexacv.online/health
   - Should return 200 OK

3. **Test Paid Template:**
   - Create a resume
   - Select Template2 (paid)
   - Check browser console - should use OpenAI API
   - Verify role analysis panel shows up

---

## 🔑 Environment Variables

### Frontend (Vercel):
- Already set in Vercel dashboard
- `VITE_API_URL` = `https://api.hexacv.online`
- `VITE_OPENAI_API_KEY` = (your key)

### Backend (EC2):
- Update `backend/.env` on EC2 with:
  - `OPENAI_API_KEY` = (your OpenAI key)
  - `GROQ_API_KEY` = (your Groq key)
  - `GEMINI_API_KEY` = (your Gemini key)

---

## 📝 Summary

All code is ready! Just:
1. Close Cursor
2. Push to GitHub
3. Vercel auto-deploys
4. Update backend on EC2
5. Done! ✅
