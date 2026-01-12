@echo off
chcp 65001 >nul
echo ============================================
echo 安装 AI 服务依赖
echo ============================================
echo.

REM 尝试多种方式找到 Python
if exist "D:\python\python.exe" (
    echo [找到] Python 在 D:\python\python.exe
    set PYTHON_CMD=D:\python\python.exe
) else if exist "C:\Python\python.exe" (
    echo [找到] Python 在 C:\Python\python.exe
    set PYTHON_CMD=C:\Python\python.exe
) else (
    echo [错误] 未找到 Python，请手动指定 Python 路径
    echo.
    echo 请运行以下命令之一：
    echo   1. D:\python\python.exe -m pip install -r requirements.txt
    echo   2. 或者将 Python 添加到系统 PATH
    echo.
    pause
    exit /b 1
)

echo.
echo [安装] 使用 %PYTHON_CMD% 安装依赖...
echo.

%PYTHON_CMD% -m pip install -r requirements.txt

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo ✅ 依赖安装成功！
    echo ============================================
    echo.
    echo 下一步：运行 python app.py 启动服务
    echo.
) else (
    echo.
    echo ============================================
    echo ❌ 依赖安装失败
    echo ============================================
    echo.
)

pause
