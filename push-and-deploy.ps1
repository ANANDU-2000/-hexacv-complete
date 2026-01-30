# Complete deployment script for HexaCV: GitHub, AWS EC2, PostgreSQL RDS, and Vercel
# Repo: https://github.com/ANANDU-2000/hexacv.git
# Run from project root: .\push-and-deploy.ps1 "Your commit message"
param(
    [Parameter(Mandatory=$false)]
    [string]$Message = "Deploy: latest updates - frontend, backend, PostgreSQL, AWS EC2, Vercel"
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/ANANDU-2000/hexacv.git"
Write-Host "🚀 Complete HexaCV Deployment - GitHub + Vercel + AWS EC2 + PostgreSQL RDS" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Green

# Check git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git not found. Install Git and try again." -ForegroundColor Red
    exit 1
}

# Ensure remote origin is correct
$origin = git remote get-url origin 2>$null
if ($origin -and $origin -ne $RepoUrl) {
    Write-Host "`n⚠️  Remote origin is: $origin" -ForegroundColor Yellow
    Write-Host "💡 Set to hexacv? Run: git remote set-url origin $RepoUrl" -ForegroundColor Yellow
}

# Status
Write-Host "`n📋 Current branch:" -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host $currentBranch
Write-Host "`n📝 Status:" -ForegroundColor Yellow
git status -s

# Confirm deployment
Write-Host "`n⚠️  This will deploy to:" -ForegroundColor Red
Write-Host "   • GitHub repository" -ForegroundColor White
Write-Host "   • Vercel (frontend)" -ForegroundColor White
Write-Host "   • AWS EC2 (backend)" -ForegroundColor White
Write-Host "   • AWS RDS PostgreSQL (database)" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Proceed with deployment? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "❌ Deployment cancelled." -ForegroundColor Red
    exit 0
}

# Stage all
Write-Host "`n📦 Staging all changes..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Commit
$changes = git status --porcelain
if ($changes) {
    Write-Host "Committing: $Message" -ForegroundColor Cyan
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Nothing to commit or commit failed. Try pushing only: git push origin main" -ForegroundColor Yellow
    }
} else {
    Write-Host "No changes to commit, proceeding to push..." -ForegroundColor Yellow
}

# Push (main or master)
$branch = git branch --show-current
if (-not $branch) { $branch = "main" }
Write-Host "Pushing to origin $branch..." -ForegroundColor Green
git push origin $branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed. Check remote. Set: git remote set-url origin $RepoUrl" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n✅ GitHub deployment complete!" -ForegroundColor Green
Write-Host "   Repository: $RepoUrl" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Vercel: Auto-deploys from GitHub (configure VITE_API_URL in dashboard)" -ForegroundColor White
Write-Host ""
Write-Host "☁️  AWS EC2 Backend Deployment Instructions:" -ForegroundColor Cyan
Write-Host "   1. SSH to your EC2 instance" -ForegroundColor White
Write-Host "   2. Navigate: cd ~/hexacv/backend" -ForegroundColor White
Write-Host "   3. Pull changes: git pull origin $branch" -ForegroundColor White
Write-Host "   4. Install deps: npm ci --production" -ForegroundColor White
Write-Host "   5. Build: npm run build" -ForegroundColor White
Write-Host "   6. Migrate DB (if needed): npm run migrate" -ForegroundColor White
Write-Host "   7. Restart: pm2 restart hexacv-backend" -ForegroundColor White
Write-Host "   8. Check status: pm2 status" -ForegroundColor White
Write-Host ""
Write-Host "🗄️  AWS RDS PostgreSQL: Ensure your .env has the correct DATABASE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Verification Steps After Deployment:" -ForegroundColor Green
Write-Host "   • Backend health: curl https://api.yourdomain.com/health" -ForegroundColor White
Write-Host "   • Frontend: Visit https://yourdomain.com" -ForegroundColor White
Write-Host "   • PM2 logs: pm2 logs hexacv-backend" -ForegroundColor White
