@echo off
chcp 65001 >nul
echo ============================================
echo 测试后端登录API
echo ============================================
echo.

echo [请求] 登录接口: POST http://localhost:3000/api/auth/login
echo [数据] {"username":"health_user","password":"password123"}
echo.

curl.exe -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"health_user\",\"password\":\"password123\"}"

echo.
echo.
echo ============================================
pause
