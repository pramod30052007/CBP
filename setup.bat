@echo off
title WorkerBook - Setup Helper
color 0A
echo.
echo  ============================================
echo   WorkerBook - Local Worker Booking Platform
echo   Setup Helper Script
echo  ============================================
echo.

:: Check Node.js
set NODE_PATH=C:\Program Files\nodejs
set PATH=%NODE_PATH%;%PATH%

node --version >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found at %NODE_PATH%
  echo Please install Node.js from https://nodejs.org
  pause
  exit /b 1
)
echo [OK] Node.js found: 
node --version

echo.
echo ============================================
echo  STEP 1: Enter your MySQL root password
echo ============================================
echo.
set /p MYSQL_PASS=Enter MySQL root password (press Enter if none): 

:: Update .env file with the password
echo Updating backend\.env ...
powershell -Command "(Get-Content 'backend\.env') -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=%MYSQL_PASS%' | Set-Content 'backend\.env'"
echo [OK] .env updated

echo.
echo ============================================
echo  STEP 2: Import Database Schema
echo ============================================
echo.
set MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe

if not exist "%MYSQL_EXE%" (
  echo [WARN] mysql.exe not found at default path.
  echo Trying MySQL Shell...
  set MYSQL_EXE=C:\Program Files\MySQL\MySQL Shell 8.0\bin\mysql.exe
)

echo Importing database/schema.sql ...
"%MYSQL_EXE%" -u root -p%MYSQL_PASS% < database\schema.sql 2>&1
if errorlevel 1 (
  echo.
  echo [WARN] Schema import may have had issues. 
  echo If the database already exists this is normal.
) else (
  echo [OK] Database schema imported successfully
)

echo.
echo ============================================
echo  STEP 3: Run Database Seeder (demo accounts)
echo ============================================
echo.
cd backend
node src/seeders/seed.js
cd ..

echo.
echo ============================================
echo  SETUP COMPLETE!
echo ============================================
echo.
echo Next Steps:
echo  1. Open a NEW CMD window and run:
echo     cd backend ^&^& npm run dev
echo.
echo  2. Open ANOTHER CMD window and run:
echo     cd frontend ^&^& npm start
echo.
echo  3. Open browser: http://localhost:3000
echo.
echo Demo Logins:
echo  Admin:   admin@workerbook.com / Admin@123
echo  Owner:   owner@grandhotel.com / Owner@123
echo  Worker:  raj@worker.com       / Worker@123
echo.
pause
