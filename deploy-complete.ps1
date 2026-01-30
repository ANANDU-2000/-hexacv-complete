# Complete HexaCV Deployment Script
# This script will push your existing code to GitHub (without env files)

param(
    [string]$RepoName = "hexacv",
    [string]$GitHubUsername = "ANANDU-2000"
)

Write-Host "=== HEXACV DEPLOYMENT SCRIPT ===" -ForegroundColor Green
Write-Host ""

# Verify we're in the right directory
$CurrentDir = Get-Location
Write-Host "Current directory: $CurrentDir" -ForegroundColor Yellow

if (-not (Test-Path ".git")) {
    Write-Host "❌ No git repository found in current directory!" -ForegroundColor Red
    Write-Host "Please run this script from your HexaCV project root." -ForegroundColor Yellow
    exit 1
}

# Check if repository already exists
$RepoUrl = "https://github.com/$GitHubUsername/$RepoName.git"
Write-Host "Checking if remote repository exists..." -ForegroundColor Yellow

try {
    git ls-remote $RepoUrl | Out-Null
    Write-Host "✓ Repository exists: $RepoUrl" -ForegroundColor Green
} catch {
    Write-Host "✗ Repository does not exist: $RepoUrl" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create the repository first:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
    Write-Host "2. Name: $RepoName" -ForegroundColor White
    Write-Host "3. Make it PUBLIC" -ForegroundColor White
    Write-Host "4. DON'T initialize with README/.gitignore" -ForegroundColor White
    Write-Host "5. Click 'Create repository'" -ForegroundColor White
    Write-Host ""
    Write-Host "After creating, run this script again." -ForegroundColor Cyan
    exit 1
}

# Set up remote
Write-Host "Setting up git remote..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $RepoUrl

# Verify .gitignore is working
Write-Host "Verifying .gitignore..." -ForegroundColor Yellow
$IgnoredFiles = git status --ignored --porcelain | Where-Object { $_ -match '!!' }
$EnvFiles = $IgnoredFiles | Where-Object { $_ -match '\.env' }

if ($EnvFiles) {
    Write-Host "✓ Environment files are properly ignored:" -ForegroundColor Green
    $EnvFiles | ForEach-Object { Write-Host "  $($_.Trim('!! '))" -ForegroundColor White }
} else {
    Write-Host "✓ No environment files found (good!)" -ForegroundColor Green
}

# Show what will be pushed
Write-Host ""
Write-Host "Files to be pushed:" -ForegroundColor Yellow
git diff --stat HEAD

Write-Host ""
Write-Host "=== READY TO PUSH ===" -ForegroundColor Green
Write-Host "Repository: $RepoUrl" -ForegroundColor Cyan
Write-Host ""

$Confirm = Read-Host "Push to GitHub? (y/N)"
if ($Confirm -ne 'y' -and $Confirm -ne 'Y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main --verbose

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCCESS! Code pushed to GitHub" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Deploy to Vercel: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "2. Import repository: $RepoUrl" -ForegroundColor White
    Write-Host "3. Add environment variables (see VERCEL-ENV-VARIABLES.txt)" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host "Check your internet connection and GitHub credentials." -ForegroundColor Yellow
}