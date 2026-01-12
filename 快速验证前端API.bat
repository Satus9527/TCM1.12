@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   前端 API 对接验证
echo ========================================
echo.

echo [步骤1] 检查服务状态...
echo.

echo 检查后端服务 (端口 3000)...
curl.exe -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务运行正常
) else (
    echo ❌ 后端服务未运行
    echo    请先运行: npm run dev
    echo.
    pause
    exit /b 1
)

echo.
echo 检查前端服务 (端口 5173)...
netstat -ano | findstr ":5173" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 前端服务运行中
) else (
    echo ❌ 前端服务未运行
    echo    请先运行: cd czb ^&^& npm run dev
    echo.
    pause
    exit /b 1
)

echo.
echo [步骤2] 测试关键 API 接口...
echo.

echo 测试药材分类 API...
curl.exe -s http://localhost:3000/api/medicine-categories | findstr /C:"success" /C:"全部药材" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 药材分类 API 正常
) else (
    echo ❌ 药材分类 API 异常
)

echo.
echo 测试药材搜索 API...
curl.exe -s "http://localhost:3000/api/medicines?page=1&limit=5" | findstr /C:"success" /C:"medicines" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 药材搜索 API 正常
) else (
    echo ❌ 药材搜索 API 异常
)

echo.
echo ========================================
echo   验证完成！
echo ========================================
echo.
echo 📋 下一步操作：
echo.
echo 1. 打开浏览器访问: http://localhost:5173
echo.
echo 2. 打开开发者工具（按 F12）
echo    - 切换到 "Console" 标签查看日志
echo    - 切换到 "Network" 标签查看 API 请求
echo.
echo 3. 测试以下功能：
echo    ✅ 用户登录
echo    ✅ 药材搜索和详情
echo    ✅ 药材分类
echo    ✅ 收藏功能
echo.
echo 4. 查看是否有 "降级到虚拟数据" 的提示
echo    - 如果有，说明真实 API 调用失败
echo    - 如果没有，说明真实 API 调用成功
echo.
echo 📖 详细测试指南请查看: 📋_前端API对接测试指南.md
echo.
pause

