@echo off
echo ==================================================
echo   SUCCESS ACADEMY - GIT DEPLOYMENT ASSISTANT
echo ==================================================
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not on your system's PATH.
    echo.
    echo To resolve this:
    echo 1. Download and install Git from: https://git-scm.com/download/win
    echo 2. Restart your terminal/command prompt.
    echo.
    pause
    exit /b
)

:: Initialize and commit
echo [1/3] Initializing local Git repository...
if not exist .git (
    git init
) else (
    echo Repository already initialized.
)

echo.
echo [2/3] Staging and committing files...
git add .
git commit -m "Initial commit - Success Academy Portal with Supabase Cloud DB"
git branch -M main

:: Get Remote URL
echo.
echo [3/3] Configure GitHub Remote:
set /p REPO_URL="https://github.com/Kushal0410/success-academy.git"

if "%REPO_URL%"=="" (
    echo [ERROR] Repository URL cannot be empty.
    pause
    exit /b
)

:: Remove existing origin if it exists, then add new one
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%

echo.
echo Pushing code to GitHub...
git push -u origin main

echo.
echo ==================================================
echo   Deployment Complete!
echo ==================================================
pause
