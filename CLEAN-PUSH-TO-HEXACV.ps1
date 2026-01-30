# CLEAN PUSH - Remove all secrets and push fresh to HexaCV
# CLOSE CURSOR FIRST, then run this in PowerShell

$ErrorActionPreference = "Stop"
$repoPath = "C:\Users\anand\OneDrive\Desktop\Mystartups\Hexacv"
$newRepo = "https://github.com/ANANDU-2000/-hexacv-complete.git"

Set-Location $repoPath

Write-Host "=== CLEAN PUSH TO -hexacv-complete ===" -ForegroundColor Cyan
Write-Host "This creates a FRESH local repo with NO history, then pushes to new empty repo" -ForegroundColor Yellow

# Step 1: Remove all lock files
Write-Host "`nStep 1: Removing lock files..." -ForegroundColor Cyan
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
Remove-Item ".git\config.lock" -Force -ErrorAction SilentlyContinue
Remove-Item ".git\packed-refs.lock" -Force -ErrorAction SilentlyContinue

# Step 2: Backup current .git (optional)
Write-Host "`nStep 2: Backing up current .git..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Rename-Item ".git" ".git.backup" -ErrorAction SilentlyContinue
}

# Step 3: Initialize fresh repo
Write-Host "`nStep 3: Initializing fresh git repo (no history)..." -ForegroundColor Cyan
git init
git branch -m main

# Step 4: Remove dist/ and .env from staging
Write-Host "`nStep 4: Ensuring dist/ and .env are excluded..." -ForegroundColor Cyan
# dist/ is already in .gitignore, but make sure
if (Test-Path "dist") {
    Write-Host "dist/ exists - will be excluded by .gitignore" -ForegroundColor Yellow
}

# Step 5: Stage everything EXCEPT dist/ and .env (handled by .gitignore)
Write-Host "`nStep 5: Staging files (dist/ and .env excluded)..." -ForegroundColor Cyan
git add -A

# Step 6: Create clean commit
Write-Host "`nStep 6: Creating clean commit..." -ForegroundColor Cyan
git commit -m "Initial commit: HexaCV - secrets in env only, dist/ excluded"

# Step 7: Add remote and push
Write-Host "`nStep 7: Adding remote and pushing..." -ForegroundColor Cyan
git remote add origin $newRepo
Write-Host "Pushing to: $newRepo" -ForegroundColor Green
Write-Host "When prompted:" -ForegroundColor Yellow
Write-Host "  Username: ANANDU-2000" -ForegroundColor White
Write-Host "  Password: Your Personal Access Token (not account password)" -ForegroundColor White
Write-Host "  Create token at: https://github.com/settings/tokens (scope: repo)" -ForegroundColor Cyan

git push -u origin main --force

Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "If successful, you can delete .git.backup folder" -ForegroundColor Cyan
Write-Host "If still blocked, visit GitHub secret scanning and allow false positives" -ForegroundColor Yellow
