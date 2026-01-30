# Push to GitHub (triggers Vercel auto-deploy)
# Repo: https://github.com/ANANDU-2000/-hexacv-complete.git
# Run: .\push-and-deploy.ps1 "Your commit message"

param(
    [Parameter(Mandatory=$false)]
    [string]$Message = "Deploy: latest updates"
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/ANANDU-2000/-hexacv-complete.git"

Write-Host "Push to GitHub (HexaCV)" -ForegroundColor Cyan

# Check git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git not found. Install Git and try again." -ForegroundColor Red
    exit 1
}

# Ensure remote origin is correct
$origin = git remote get-url origin 2>$null
if ($origin -and $origin -ne $RepoUrl) {
    Write-Host "Remote origin is: $origin" -ForegroundColor Yellow
    Write-Host "Setting to: $RepoUrl" -ForegroundColor Yellow
    git remote set-url origin $RepoUrl
}

# Stage all
Write-Host "`nStaging changes..." -ForegroundColor Cyan
git add -A

# Commit
Write-Host "Committing: $Message" -ForegroundColor Cyan
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit or commit failed." -ForegroundColor Yellow
}

# Push
$branch = git branch --show-current
if (-not $branch) { $branch = "main" }
Write-Host "`nPushing to origin $branch..." -ForegroundColor Green
git push origin $branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed. Check remote: git remote set-url origin $RepoUrl" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`nDone. Vercel will auto-deploy if repo is connected." -ForegroundColor Green
