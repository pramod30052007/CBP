@echo off
title WorkerBook - Start Frontend
color 0B
set PATH=C:\Program Files\nodejs;%PATH%
echo.
echo  ======================================
echo   WorkerBook - Starting Frontend...
echo  ======================================
echo.
cd /d "c:\Users\hi\OneDrive\Desktop\Pramod\hotel-booking-platform\frontend"
echo  Opening http://localhost:3000 in browser...
echo  Press Ctrl+C to stop.
echo.
npm start
pause
