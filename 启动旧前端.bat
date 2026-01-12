@echo off
chcp 65001 >nul
echo ============================================
echo 启动本草智汇平台 - 旧前端界面
echo ============================================
echo.
echo 端口: 5173
echo 访问: http://localhost:5173
echo.

cd /d "%~dp0czb"

if not exist "node_modules" (
    echo [提示] 正在安装依赖...
    call npm install
    echo.
)

echo [启动] 正在启动开发服务器...
echo.
npm run dev

pause
