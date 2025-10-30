@echo off
chcp 65001 >nul
echo ====================================
echo   TCM 平台后端服务器启动脚本
echo ====================================
echo.

cd /d "D:\TCM web"

echo [1/3] 检查 MySQL 服务状态...
sc query MySQL | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ❌ MySQL 服务未运行！
    echo 请以管理员身份运行 PowerShell 并执行：
    echo    Start-Service MySQL
    echo.
    pause
    exit /b 1
) else (
    echo ✅ MySQL 服务正在运行
)

echo.
echo [2/3] 检查当前目录...
echo 📁 当前目录: %CD%
echo.

echo [3/3] 启动开发服务器...
echo 🚀 正在启动 nodemon...
echo.
echo ----------------------------------------
echo 如果看到以下信息表示启动成功：
echo   🚀 TCM Platform Backend Server
echo   🌐 Server: http://localhost:3000
echo ----------------------------------------
echo.

npm run dev

pause

