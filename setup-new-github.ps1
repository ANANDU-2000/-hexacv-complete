# Setup New GitHub Repository Script
# Run this after creating your new repository on GitHub

Write-Host "=== Setting up new GitHub repository ===" -ForegroundColor Green

# Remove old remotes
Write-Host "Removing old git remotes..." -ForegroundColor Yellow
git remote remove origin
git remote remove hexacv

# Add new remote (replace with your actual repo URL)
$NEW_REPO_URL = "https://github.com/ANANDU-2000/hexaresume.git"
Write-Host "Adding new remote: $NEW_REPO_URL" -ForegroundColor Yellow
git remote add origin $NEW_REPO_URL

# Verify remote
Write-Host "Verifying remote..." -ForegroundColor Yellow
git remote -v

# Push to new repository
Write-Host "Pushing to new repository..." -ForegroundColor Yellow
Write-Host "This may ask for your GitHub credentials/token" -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "=== SUCCESS ===" -ForegroundColor Green
Write-Host "Your code has been pushed to the new repository!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to Vercel Dashboard" -ForegroundColor White
Write-Host "2. Remove old project (if exists)" -ForegroundColor White
Write-Host "3. Import new project from: $NEW_REPO_URL" -ForegroundColor White
Write-Host "4. Set environment variables in Vercel" -ForegroundColor White
Write-Host ""

# Show current commit
Write-Host "Latest commit:" -ForegroundColor Yellow
git log --oneline -1