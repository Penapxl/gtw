@echo off
REM Konfigurasi Ngrok dengan authtoken
ngrok config add-authtoken 32GOqEkSYQsOV6Jw924vcHtQq8Q_7FQavERZNUDJvZpjrLRPk

REM Start Ngrok dengan domain statis
ngrok http --domain=weariful-kandi-honourless.ngrok-free.dev 3000
