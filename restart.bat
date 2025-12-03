@echo off
echo ========================================
echo   WhatsApp Gateway - Restarting
echo ========================================
echo.

call pm2 restart wa-gateway
call pm2 restart wa-ngrok

echo.
echo Server berhasil di-restart!
echo.
pause
