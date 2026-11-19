@echo off
title WorkerBook - Start Backend
color 0A
set PATH=C:\Program Files\nodejs;%PATH%
echo.
echo  ======================================
echo   WorkerBook - Starting Backend...
echo  ======================================
echo.
cd /d "c:\Users\hi\OneDrive\Desktop\Pramod\hotel-booking-platform\backend"
echo  API running at http://localhost:5000/api
echo  Press Ctrl+C to stop.
echo.
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
pause
