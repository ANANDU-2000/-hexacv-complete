# Vercel Deployment Setup Script

param(
    [string]$ProjectName = "hexacv",
    [string]$RepoUrl = "https://github.com/ANANDU-2000/HexaCV.git"
)

Write-Host "=== HEXACV VERCEL DEPLOYMENT SETUP ===" -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host ""
Write-Host "=== STEP 1: LOGIN TO VERCEL ===" -ForegroundColor Cyan
Write-Host "Please login to Vercel in your browser when prompted"
Write-Host ""
vercel login

Write-Host ""
Write-Host "=== STEP 2: REMOVE OLD PROJECT (if exists) ===" -ForegroundColor Cyan
Write-Host "If you have an old HexaCV project, please remove it from Vercel Dashboard first"
Write-Host "URL: https://vercel.com/dashboard"
Write-Host ""
Write-Host "Press Enter when ready..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "=== STEP 3: DEPLOY TO VERCEL ===" -ForegroundColor Cyan
Write-Host "Deploying from: $RepoUrl"
Write-Host ""

# Deploy to Vercel
vercel --prod --confirm --name $ProjectName

Write-Host ""
Write-Host "=== STEP 4: SET ENVIRONMENT VARIABLES ===" -ForegroundColor Cyan
Write-Host "Please add these environment variables in Vercel Dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Project Settings > Environment Variables" -ForegroundColor White
Write-Host ""
Write-Host "Required Variables:" -ForegroundColor Green
Write-Host "-------------------" -ForegroundColor Green
Write-Host "VITE_GEMINI_API_KEY = your_gemini_api_key_here" -ForegroundColor White
Write-Host "VITE_GROQ_API_KEY = your_groq_api_key_here" -ForegroundColor White
Write-Host "VITE_OPENAI_API_KEY = your_openai_api_key_here" -ForegroundColor White
Write-Host "VITE_API_URL = https://api.hexacv.online" -ForegroundColor White
Write-Host ""
Write-Host "Where to get API keys:" -ForegroundColor Yellow
Write-Host "1. Gemini: https://aistudio.google.com/app/apikey (FREE)" -ForegroundColor White
Write-Host "2. Groq: https://console.groq.com/keys (FREE)" -ForegroundColor White
Write-Host "3. OpenAI: https://platform.openai.com/api-keys (PAID)" -ForegroundColor White
Write-Host ""
Write-Host "=== STEP 5: REDPLOY WITH ENV VARIABLES ===" -ForegroundColor Cyan
Write-Host "After adding environment variables, redeploy:" -ForegroundColor Yellow
Write-Host "vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "=== SUCCESS! ===" -ForegroundColor Green
Write-Host "Your frontend should now be live at: https://$ProjectName.vercel.app" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the frontend" -ForegroundColor White
Write-Host "2. Set up backend API (AWS EC2)" -ForegroundColor White
Write-Host "3. Update VITE_API_URL with backend URL" -ForegroundColor White
Write-Host "4. Redeploy frontend" -ForegroundColor White