# deploy-all.ps1
# Complete deployment script for HexaCV: GitHub, AWS EC2, PostgreSQL RDS, and Vercel

param(
    [Parameter(Mandatory=$false)]
    [string]$Message = "Deploy: Latest updates - GitHub, AWS EC2, PostgreSQL RDS, Vercel"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Complete HexaCV Deployment Script" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Validate prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git not found. Install Git and try again." -ForegroundColor Red
    exit 1
}

# Check if in git repository
try {
    $repoRoot = git rev-parse --show-toplevel 2>$null
    if (-not $repoRoot) {
        Write-Host "❌ Not in a git repository." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Not in a git repository." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git is available" -ForegroundColor Green
Write-Host "📁 Repository: $repoRoot" -ForegroundColor Green

# Show current status
Write-Host "`n📋 Current status:" -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Branch: $currentBranch"
$changes = git status --porcelain
if ($changes) {
    Write-Host "Changes detected:"
    Write-Host $changes
} else {
    Write-Host "No changes detected"
}

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

# 1. Push to GitHub (triggers Vercel auto-deploy)
Write-Host "`n1. 📦 Pushing to GitHub..." -ForegroundColor Yellow

# Stage all changes
Write-Host "   Staging all changes..."
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "   Committing changes: $Message"
    git commit -m $Message
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Commit failed!" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} else {
    Write-Host "   No changes to commit, proceeding to push..."
}

# Get current branch
$branch = git branch --show-current
if (-not $branch) {
    $branch = "main"  # default to main if no branch is checked out
}

Write-Host "   Pushing to origin $branch..."
git push origin $branch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ GitHub push failed!" -ForegroundColor Red
    exit $LASTEXITCODE
} else {
    Write-Host "✅ GitHub deployment triggered" -ForegroundColor Green
    Write-Host "   Repository: $(git remote get-url origin)" -ForegroundColor White
}

# 2. Prepare EC2 backend deployment instructions
Write-Host "`n2. ☁️  Preparing AWS EC2 backend deployment..." -ForegroundColor Yellow

Write-Host "   The backend needs to be deployed to your EC2 instance." -ForegroundColor White
Write-Host "   Run these commands on your EC2 instance:" -ForegroundColor White
Write-Host ""
Write-Host "   # Navigate to backend directory" -ForegroundColor Cyan
Write-Host "   cd ~/hexacv/backend" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Pull latest changes from GitHub" -ForegroundColor Cyan
Write-Host "   git pull origin $branch" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Install production dependencies" -ForegroundColor Cyan
Write-Host "   npm ci --production" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Build the application" -ForegroundColor Cyan
Write-Host "   npm run build" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Run database migrations (if needed)" -ForegroundColor Cyan
Write-Host "   npm run migrate" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Restart the backend service" -ForegroundColor Cyan
Write-Host "   pm2 restart hexacv-backend" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Check the status" -ForegroundColor Cyan
Write-Host "   pm2 status" -ForegroundColor Cyan
Write-Host ""

# 3. PostgreSQL Migration Reminder
Write-Host "3. 🗄️  Database Migration" -ForegroundColor Yellow
Write-Host "   If there are schema changes, run migrations on EC2:" -ForegroundColor White
Write-Host "   cd ~/hexacv/backend && npm run migrate" -ForegroundColor Cyan
Write-Host ""

# 4. Verification Steps
Write-Host "4. ✅ Post-Deployment Verification" -ForegroundColor Yellow
Write-Host "   After deployment, verify everything works:" -ForegroundColor White
Write-Host ""
Write-Host "   # Backend health check (replace with your API domain)" -ForegroundColor Cyan
Write-Host "   curl https://api.yourdomain.com/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Check PM2 logs on EC2" -ForegroundColor Cyan
Write-Host "   pm2 logs hexacv-backend --lines 20" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Visit your frontend (replace with your domain)" -ForegroundColor Cyan
Write-Host "   Open https://yourdomain.com in browser" -ForegroundColor Cyan
Write-Host ""

# 5. Platform Links
Write-Host "5. 🌐 Platform Links" -ForegroundColor Yellow
Write-Host "   GitHub: https://github.com/ANANDU-2000/hexacv" -ForegroundColor White
Write-Host "   Vercel: https://yourdomain.com" -ForegroundColor White
Write-Host "   AWS Console: https://console.aws.amazon.com" -ForegroundColor White
Write-Host "   RDS Console: https://console.aws.amazon.com/rds" -ForegroundColor White
Write-Host ""

Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Complete the EC2 backend deployment using the commands above" -ForegroundColor White
Write-Host "2. Verify all services are working properly" -ForegroundColor White
Write-Host "3. Monitor logs for any issues" -ForegroundColor White
Write-Host "4. Update DNS records if using new domains" -ForegroundColor White