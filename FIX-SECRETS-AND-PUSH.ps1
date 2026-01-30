# Fix secrets in git history and push to HexaCV
# Run this in PowerShell (CLOSE CURSOR FIRST)

$ErrorActionPreference = "Stop"
$repoPath = "C:\Users\anand\OneDrive\Desktop\Mystartups\Hexacv"
$newRepo = "https://github.com/ANANDU-2000/HexaCV.git"

Set-Location $repoPath

Write-Host "=== Step 1: Remove dist/ from git (build output with secrets) ===" -ForegroundColor Cyan
git rm -r --cached dist/ -ErrorAction SilentlyContinue
git rm -r --cached dist_electron/ -ErrorAction SilentlyContinue

Write-Host "`n=== Step 2: Remove old remotes ===" -ForegroundColor Cyan
git remote remove hexacv -ErrorAction SilentlyContinue
git remote remove origin -ErrorAction SilentlyContinue

Write-Host "`n=== Step 3: Check for .env files in git ===" -ForegroundColor Cyan
$envFiles = git ls-files | Select-String "\.env$"
if ($envFiles) {
    Write-Host "WARNING: .env files found in git! Removing..." -ForegroundColor Yellow
    git rm --cached .env -ErrorAction SilentlyContinue
    git rm --cached backend/.env -ErrorAction SilentlyContinue
}

Write-Host "`n=== Step 4: Stage all changes (dist/ excluded by .gitignore) ===" -ForegroundColor Cyan
git add -A

Write-Host "`n=== Step 5: Create fresh commit WITHOUT dist/ ===" -ForegroundColor Cyan
Write-Host "This creates a new commit without dist/ (which had secrets)..." -ForegroundColor Yellow

# Check if this is a fresh repo or has history
$hasCommits = git rev-parse --verify HEAD 2>$null
if ($hasCommits) {
    Write-Host "Creating orphan branch (fresh start, no old commits with secrets)..." -ForegroundColor Yellow
    git checkout --orphan clean-main
    git add -A
    git commit -m "HexaCV: clean commit - secrets in env only, dist/ excluded"
    git branch -D main -ErrorAction SilentlyContinue
    git branch -m main
} else {
    git commit -m "HexaCV: initial commit - secrets in env only, dist/ excluded"
}

Write-Host "`n=== Step 6: Add remote and push ===" -ForegroundColor Cyan
git remote add origin $newRepo
Write-Host "Pushing to: $newRepo" -ForegroundColor Green
Write-Host "When prompted, use your Personal Access Token as password" -ForegroundColor Yellow
git push -u origin main --force

Write-Host "`n=== Done ===" -ForegroundColor Green
Write-Host "dist/ is now excluded - GitHub won't scan built files with secrets" -ForegroundColor Cyan
