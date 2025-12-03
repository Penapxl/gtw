@echo off
echo ========================================
echo   WhatsApp Gateway - Stopping Server
echo ========================================
echo.

call pm2 stop wa-gateway
call pm2 stop wa-ngrok

echo.
echo Server berhasil dihentikan!
echo Gunakan 'start.bat' untuk menjalankan kembali
echo.
pause
