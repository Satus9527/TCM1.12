@echo off
chcp 65001 >nul
echo ============================================
echo   启动所有服务并自检
echo ============================================
echo.

cd /d "D:\TCM web"

:: 检查MySQL服务
echo [1/5] 检查 MySQL 服务...
sc query MySQL | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ⚠️  MySQL 服务未运行
    echo    请以管理员身份启动: Start-Service MySQL
) else (
    echo ✅ MySQL 服务正在运行
)
echo.

:: 检查端口占用
echo [2/5] 检查端口占用情况...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ⚠️  端口 3000 (后端) 已被占用
) else (
    echo ✅ 端口 3000 (后端) 可用
)

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ⚠️  端口 5173 (前端) 已被占用
) else (
    echo ✅ 端口 5173 (前端) 可用
)

netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ⚠️  端口 5000 (AI服务) 已被占用
) else (
    echo ✅ 端口 5000 (AI服务) 可用
)
echo.

:: 启动后端服务
echo [3/5] 启动后端服务 (端口 3000)...
start "后端服务-3000" cmd /k "cd /d D:\TCM web && npm run dev"
timeout /t 5 /nobreak >nul
echo ✅ 后端服务启动中...
echo.

:: 启动AI服务
echo [4/5] 启动AI服务 (端口 5000)...
cd /d "D:\TCM web\zhongjing-ai-api"
start "AI服务-5000" cmd /k "D:\python\python.exe app.py"
cd /d "D:\TCM web"
timeout /t 5 /nobreak >nul
echo ✅ AI服务启动中...
echo.

:: 启动前端服务
echo [5/5] 启动前端服务 (端口 5173)...
cd /d "D:\TCM web\czb"
start "前端服务-5173" cmd /k "npm run dev"
cd /d "D:\TCM web"
timeout /t 8 /nobreak >nul
echo ✅ 前端服务启动中...
echo.

:: 等待服务启动完成
echo 等待服务启动 (15秒)...
timeout /t 15 /nobreak >nul
echo.

:: 执行健康检查
echo ============================================
echo   健康检查
echo ============================================
echo.

:: 检查后端
echo [检查1] 后端服务健康检查...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务运行正常 (http://localhost:3000)
) else (
    echo ❌ 后端服务无响应
)
echo.

:: 检查AI服务
echo [检查2] AI服务健康检查...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ AI服务运行正常 (http://localhost:5000)
) else (
    echo ❌ AI服务无响应
)
echo.

:: 检查前端
echo [检查3] 前端服务检查...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 前端服务运行正常 (http://localhost:5173)
) else (
    echo ❌ 前端服务无响应
)
echo.

echo ============================================
echo   启动完成
echo ============================================
echo.
echo 访问地址:
echo   后端: http://localhost:3000/api/health
echo   前端: http://localhost:5173
echo   AI服务: http://localhost:5000
echo.
echo 注意: 已打开三个新窗口运行服务，请勿关闭它们
echo.
pause
