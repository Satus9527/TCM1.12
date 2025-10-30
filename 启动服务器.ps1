# TCM 平台后端服务器启动脚本

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  TCM 平台后端服务器启动脚本" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 切换到项目目录
Set-Location "D:\TCM web"
Write-Host "[1/4] 当前目录:" (Get-Location) -ForegroundColor Green

# 检查 MySQL 服务
Write-Host ""
Write-Host "[2/4] 检查 MySQL 服务状态..." -ForegroundColor Yellow
$mysqlService = Get-Service MySQL -ErrorAction SilentlyContinue
if ($mysqlService -and $mysqlService.Status -eq 'Running') {
    Write-Host "✅ MySQL 服务正在运行" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL 服务未运行！" -ForegroundColor Red
    Write-Host "请以管理员身份运行 PowerShell 并执行: Start-Service MySQL" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 检查 package.json
Write-Host ""
Write-Host "[3/4] 检查项目文件..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✅ package.json 存在" -ForegroundColor Green
} else {
    Write-Host "❌ 找不到 package.json，请确认在正确的目录" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 启动服务器
Write-Host ""
Write-Host "[4/4] 启动开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 正在启动 nodemon..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "如果看到以下信息表示启动成功：" -ForegroundColor Gray
Write-Host "  🚀 TCM Platform Backend Server" -ForegroundColor Gray
Write-Host "  🌐 Server: http://localhost:3000" -ForegroundColor Gray
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

npm run dev

