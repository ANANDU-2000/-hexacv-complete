# Push to NEW empty repo: -hexacv-complete
# CLOSE CURSOR FIRST, then run this in PowerShell

$ErrorActionPreference = "Stop"
$repoPath = "C:\Users\anand\OneDrive\Desktop\Mystartups\Hexacv"
$newRepo = "https://github.com/ANANDU-2000/-hexacv-complete.git"

Set-Location $repoPath

Write-Host "=== PUSH TO NEW EMPTY REPO ===" -ForegroundColor Cyan
Write-Host "Repo: $newRepo" -ForegroundColor Green
Write-Host "This creates FRESH local repo (no history) then pushes" -ForegroundColor Yellow

# Step 1: Remove lock files
Write-Host "`nStep 1: Removing lock files..." -ForegroundColor Cyan
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
Remove-Item ".git\config.lock" -Force -ErrorAction SilentlyContinue
Remove-Item ".git\packed-refs.lock" -Force -ErrorAction SilentlyContinue

# Step 2: Backup current .git
Write-Host "`nStep 2: Backing up current .git..." -ForegroundColor Cyan
if (Test-Path ".git") {
    if (Test-Path ".git.backup") {
        Remove-Item ".git.backup" -Recurse -Force
    }
    Rename-Item ".git" ".git.backup"
    Write-Host "Backed up to .git.backup" -ForegroundColor Green
}

# Step 3: Initialize FRESH repo (NO HISTORY)
Write-Host "`nStep 3: Initializing fresh git repo (no history)..." -ForegroundColor Cyan
git init
git branch -m main
Write-Host "Fresh repo initialized" -ForegroundColor Green

# Step 4: Stage files (dist/ excluded by .gitignore)
Write-Host "`nStep 4: Staging files (dist/ and .env excluded by .gitignore)..." -ForegroundColor Cyan
git add -A
$staged = git status --short
Write-Host "Staged files:" -ForegroundColor Green
Write-Host $staged

# Step 5: Create ONE clean commit
Write-Host "`nStep 5: Creating clean commit..." -ForegroundColor Cyan
git commit -m "Initial commit: HexaCV - secrets in env only, dist/ excluded"
Write-Host "Commit created" -ForegroundColor Green

# Step 6: Add remote and push
Write-Host "`nStep 6: Adding remote and pushing..." -ForegroundColor Cyan
git remote add origin $newRepo
Write-Host "Remote added: $newRepo" -ForegroundColor Green
Write-Host "`nPUSHING..." -ForegroundColor Yellow
Write-Host "When prompted:" -ForegroundColor Cyan
Write-Host "  Username: ANANDU-2000" -ForegroundColor White
Write-Host "  Password: Your Personal Access Token (create at https://github.com/settings/tokens)" -ForegroundColor White

git push -u origin main --force

Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "If successful, code is now at: $newRepo" -ForegroundColor Cyan
Write-Host "You can delete .git.backup folder if push succeeded" -ForegroundColor Yellow
