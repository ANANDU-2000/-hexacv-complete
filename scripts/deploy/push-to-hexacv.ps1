# Add HexaCV as remote and push (run from project root)
# Repo: https://github.com/ANANDU-2000/HexaCV
# Full steps: docs/deployment/PUSH-TO-HEXACV.md

$ErrorActionPreference = "Stop"
$HexaCV = "https://github.com/ANANDU-2000/HexaCV.git"

# Run from repo root
$root = (Get-Item $PSScriptRoot).Parent.Parent.FullName
Set-Location $root

$existing = git remote get-url hexacv 2>$null
if ($existing) {
    Write-Host "Remote 'hexacv' already exists: $existing" -ForegroundColor Yellow
} else {
    git remote add hexacv $HexaCV
    Write-Host "Added remote: hexacv -> $HexaCV" -ForegroundColor Green
}

Write-Host "`nPush to HexaCV (use PAT as password when prompted):" -ForegroundColor Cyan
Write-Host "  git push -u hexacv main" -ForegroundColor White
Write-Host "`nOr to make HexaCV the default origin:" -ForegroundColor Cyan
Write-Host "  git remote set-url origin $HexaCV" -ForegroundColor White
Write-Host "  git push -u origin main" -ForegroundColor White
