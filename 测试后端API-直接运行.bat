@echo off
chcp 65001 >nul
echo ============================================
echo 测试后端登录API
echo ============================================
echo.

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File ".\测试后端API.ps1"

pause
