@echo off
setlocal enabledelayedexpansion

echo 🚀 Complete HexaCV Deployment Script
echo ===================================

:: Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not found. Install Git and try again.
    exit /b 1
) else (
    echo ✅ Git is available
)

:: Check if in git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ❌ Not in a git repository.
    exit /b 1
)

:: Show current status
echo.
echo 📋 Current status:
for /f "delims=" %%i in ('git branch --show-current') do set current_branch=%%i
echo Branch: !current_branch!

:: Get changes
git status --porcelain > temp_changes.txt
set /p changes=<temp_changes.txt
if "!changes!" neq "" (
    echo Changes detected
) else (
    echo No changes detected
)
del temp_changes.txt

echo.
echo ⚠️  This will deploy to:
echo    • GitHub repository
echo    • Vercel (frontend)
echo    • AWS EC2 (backend)
echo    • AWS RDS PostgreSQL (database)
echo.

set /p confirm="Proceed with deployment? (y/N): "
if /i not "!confirm!"=="y" (
    echo ❌ Deployment cancelled.
    exit /b 0
)

:: 1. Push to GitHub (triggers Vercel auto-deploy)
echo.
echo 1. 📦 Pushing to GitHub...
echo    Staging all changes...
git add .

:: Check if there are changes to commit
git status --porcelain > temp_status.txt
set /p status=<temp_status.txt
if "!status!" neq "" (
    echo    Committing changes: Deploy: Latest updates - GitHub, AWS EC2, PostgreSQL RDS, Vercel
    git commit -m "Deploy: Latest updates - GitHub, AWS EC2, PostgreSQL RDS, Vercel"
    if errorlevel 1 (
        echo ❌ Commit failed!
        del temp_status.txt
        exit /b 1
    )
) else (
    echo    No changes to commit, proceeding to push...
)
del temp_status.txt

:: Get current branch
for /f "delims=" %%i in ('git branch --show-current') do set branch=%%i
if "!branch!"=="" set branch=main

echo    Pushing to origin !branch!...
git push origin !branch!
if errorlevel 1 (
    echo ❌ GitHub push failed!
    exit /b 1
) else (
    echo ✅ GitHub deployment triggered
    for /f "delims=" %%i in ('git remote get-url origin') do echo    Repository: %%i
)

:: 2. Prepare EC2 backend deployment instructions
echo.
echo 2. ☁️  Preparing AWS EC2 backend deployment...
echo    The backend needs to be deployed to your EC2 instance.
echo    Run these commands on your EC2 instance:
echo.
echo    # Navigate to backend directory
echo    cd ~/hexacv/backend
echo.
echo    # Pull latest changes from GitHub
echo    git pull origin !branch!
echo.
echo    # Install production dependencies
echo    npm ci --production
echo.
echo    # Build the application
echo    npm run build
echo.
echo    # Run database migrations (if needed)
echo    npm run migrate
echo.
echo    # Restart the backend service
echo    pm2 restart hexacv-backend
echo.
echo    # Check the status
echo    pm2 status
echo.

:: 3. PostgreSQL Migration Reminder
echo 3. 🗄️  Database Migration
echo    If there are schema changes, run migrations on EC2:
echo    cd ~/hexacv/backend ^&^& npm run migrate
echo.

:: 4. Verification Steps
echo 4. ✅ Post-Deployment Verification
echo    After deployment, verify everything works:
echo.
echo    # Backend health check (replace with your API domain)
echo    curl https://api.yourdomain.com/health
echo.
echo    # Check PM2 logs on EC2
echo    pm2 logs hexacv-backend --lines 20
echo.
echo    # Visit your frontend (replace with your domain)
echo    Open https://yourdomain.com in browser
echo.

:: 5. Platform Links
echo 5. 🌐 Platform Links
echo    GitHub: https://github.com/ANANDU-2000/hexacv
echo    Vercel: https://yourdomain.com
echo    AWS Console: https://console.aws.amazon.com
echo    RDS Console: https://console.aws.amazon.com/rds
echo.

echo ✅ Deployment preparation complete!
echo.
echo Next steps:
echo 1. Complete the EC2 backend deployment using the commands above
echo 2. Verify all services are working properly
echo 3. Monitor logs for any issues
echo 4. Update DNS records if using new domains

pause