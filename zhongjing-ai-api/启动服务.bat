@echo off
chcp 65001 >nul
echo ============================================
echo 启动 AI 服务
echo ============================================
echo.

REM 尝试多种方式找到 Python
if exist "D:\python\python.exe" (
    set PYTHON_CMD=D:\python\python.exe
) else if exist "C:\Python\python.exe" (
    set PYTHON_CMD=C:\Python\python.exe
) else (
    echo [错误] 未找到 Python，请手动指定 Python 路径
    echo.
    echo 请运行：D:\python\python.exe app.py
    echo.
    pause
    exit /b 1
)

echo [启动] Flask REST API: http://localhost:5000
echo [启动] Gradio 界面: http://localhost:7860
echo.
echo 按 Ctrl+C 停止服务
echo.

%PYTHON_CMD% app.py

pause
