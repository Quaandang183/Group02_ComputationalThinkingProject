@echo off
title TripWise Server
cd /d "%~dp0"
echo ===================================================
echo     DANG KHOI DONG HE THONG TRIPWISE LOCAL
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    node main.js
    goto end
)

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo Khong tim thay Node.js, dang su dung Python...
    start "" http://localhost:3000/intro.html
    python -m http.server 3000
    goto end
)

echo [LOI] May cua ban chua cai Node.js hoac Python.
echo Dang mo truc tiep file intro.html bang trinh duyet...
start "" "%~dp0intro.html"

:end
pause

