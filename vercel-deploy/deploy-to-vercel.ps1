# Vercel Deployment Helper Script

Write-Host "=== HEXACV VERCEL DEPLOYMENT HELPER ===" -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✓ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host ""
Write-Host "=== STEP 1: LOGIN TO VERCEL ===" -ForegroundColor Cyan
Write-Host "A browser window will open for you to login"
Write-Host ""
vercel login

Write-Host ""
Write-Host "=== STEP 2: DEPLOY PROJECT ===" -ForegroundColor Cyan
Write-Host "Deploying to Vercel..."
Write-Host ""

# Deploy to production
vercel --prod --confirm --name hexacv

Write-Host ""
Write-Host "=== IMPORTANT: SET ENVIRONMENT VARIABLES ===" -ForegroundColor Red
Write-Host "After deployment, go to Vercel Dashboard and add these variables:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Project Settings → Environment Variables" -ForegroundColor White
Write-Host ""
Write-Host "VITE_GEMINI_API_KEY = your_gemini_api_key" -ForegroundColor Green
Write-Host "VITE_GROQ_API_KEY = your_groq_api_key" -ForegroundColor Green
Write-Host "VITE_OPENAI_API_KEY = your_openai_api_key" -ForegroundColor Green
Write-Host "VITE_API_URL = https://api.hexacv.online" -ForegroundColor Green
Write-Host ""
Write-Host "Get free API keys:" -ForegroundColor Yellow
Write-Host "- Gemini: https://aistudio.google.com/app/apikey" -ForegroundColor White
Write-Host "- Groq: https://console.groq.com/keys" -ForegroundColor White
Write-Host ""
Write-Host "=== AFTER ADDING VARIABLES ===" -ForegroundColor Cyan
Write-Host "Run this command to redeploy with environment variables:" -ForegroundColor Yellow
Write-Host "vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "Your site will be live at: https://hexacv.vercel.app" -ForegroundColor Green