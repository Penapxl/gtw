@echo off
echo ========================================
echo   WhatsApp Gateway - Logs
echo ========================================
echo.
echo Tekan Ctrl+C untuk keluar dari log
echo.

call pm2 logs wa-gateway
