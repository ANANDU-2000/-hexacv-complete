# Repository Verification Script

Write-Host "=== HEXACV REPOSITORY VERIFICATION ===" -ForegroundColor Green
Write-Host ""

# Check current remote
Write-Host "1. Checking current remote..." -ForegroundColor Yellow
git remote -v

Write-Host ""
Write-Host "2. Checking remote URL..." -ForegroundColor Yellow
git remote get-url origin

Write-Host ""
Write-Host "3. Checking if repository exists..." -ForegroundColor Yellow
try {
    git ls-remote origin
    Write-Host "✓ Repository exists and is accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ Repository not found or inaccessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Checking local commits..." -ForegroundColor Yellow
git log --oneline -5

Write-Host ""
Write-Host "=== VERIFICATION COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "If repository exists, visit: https://github.com/ANANDU-2000/hexacv" -ForegroundColor Cyan
Write-Host "If you see a 404 error, you need to create the repository on GitHub first." -ForegroundColor Yellow