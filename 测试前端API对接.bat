@echo off
chcp 65001 >nul
echo ========================================
echo 前端 API 对接测试
echo ========================================
echo.

echo [1/5] 检查后端服务状态...
curl.exe -s http://localhost:3000/api/health >nul
if %errorlevel% equ 0 (
    echo ✅ 后端服务运行正常 (端口 3000)
) else (
    echo ❌ 后端服务未运行，请先启动后端服务
    pause
    exit /b 1
)

echo.
echo [2/5] 检查前端服务状态...
curl.exe -s -o nul -w "HTTP状态码: %%{http_code}\n" http://localhost:5173
if %errorlevel% equ 0 (
    echo ✅ 前端服务运行正常 (端口 5173)
) else (
    echo ❌ 前端服务未运行，请先启动前端服务
    pause
    exit /b 1
)

echo.
echo [3/5] 测试药材API - 获取分类...
curl.exe -s http://localhost:3000/api/medicine-categories | findstr /C:"success" >nul
if %errorlevel% equ 0 (
    echo ✅ 药材分类API正常
) else (
    echo ❌ 药材分类API异常
)

echo.
echo [4/5] 测试药材API - 搜索药材...
curl.exe -s "http://localhost:3000/api/medicines?page=1&limit=5" | findstr /C:"success" >nul
if %errorlevel% equ 0 (
    echo ✅ 药材搜索API正常
) else (
    echo ❌ 药材搜索API异常
)

echo.
echo [5/5] 测试用户认证API - 健康检查...
curl.exe -s http://localhost:3000/api/auth/profile -H "Authorization: Bearer test" 2>nul | findstr /C:"401" /C:"Unauthorized" >nul
if %errorlevel% equ 0 (
    echo ✅ 用户认证API正常（返回401是预期的，因为未提供有效token）
) else (
    echo ⚠️  用户认证API可能需要检查
)

echo.
echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 📋 下一步操作：
echo 1. 打开浏览器访问: http://localhost:5173
echo 2. 打开浏览器开发者工具（F12）
echo 3. 切换到 "Network" 标签
echo 4. 测试登录、药材搜索等功能
echo 5. 查看控制台是否有 "降级到虚拟数据" 的提示
echo.
pause

