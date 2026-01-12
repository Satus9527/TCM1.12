@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File ".\测试推荐-简化版.ps1"
pause
