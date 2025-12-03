@echo off
echo ========================================
echo   WhatsApp Gateway - Starting Server
echo ========================================
echo.

REM Install PM2 jika belum ada
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Installing PM2...
    call npm install -g pm2
)

REM Install dependencies
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
)

REM Stop existing processes
echo [INFO] Stopping existing processes...
call pm2 delete wa-gateway 2>nul
call pm2 delete wa-ngrok 2>nul

REM Start server
echo [INFO] Starting WhatsApp Gateway Server...
call pm2 start server.js --name wa-gateway

REM Start Ngrok
echo [INFO] Starting Ngrok tunnel...
call pm2 start ngrok.bat --name wa-ngrok

REM Save PM2 configuration
call pm2 save

echo.
echo ========================================
echo   Server Started Successfully!
echo ========================================
echo.
echo Dashboard: http://localhost:3000
echo Public URL: https://weariful-kandi-honourless.ngrok-free.dev
echo.
echo Gunakan 'stop.bat' untuk menghentikan server
echo Gunakan 'status.bat' untuk melihat status
echo Gunakan 'logs.bat' untuk melihat log
echo.
pause
