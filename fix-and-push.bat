@echo off
REM Run this in CMD (not PowerShell) from the project folder.
REM Close Cursor/VS Code first so nothing locks .git

cd /d "C:\Users\anand\OneDrive\Desktop\-hexacv-complete-main"

echo Removing stale lock...
del /f /q ".git\index.lock" 2>nul
if exist ".git\index.lock" (
  echo FAILED: Could not delete .git\index.lock
  echo Close Cursor, Git GUI, and any terminal using this repo, then run this again.
  pause
  exit /b 1
)

echo Aborting rebase so we can commit cleanly...
git rebase --abort 2>nul

echo Staging all files...
git add -A
if errorlevel 1 (
  echo git add failed. Check errors above.
  pause
  exit /b 1
)

echo Committing...
git commit -m "UX plan + payment fix (49 rupees, DB webhook) + admin APIs + paid rewrite gate"
if errorlevel 1 (
  echo commit failed or nothing to commit.
  pause
  exit /b 1
)

echo Pushing to origin main...
git push origin main
if errorlevel 1 (
  echo push failed. Check network / auth.
  pause
  exit /b 1
)

echo Done. Code pushed to GitHub.
pause
