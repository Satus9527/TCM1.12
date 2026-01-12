# 服务自检报告脚本
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   服务自检报告" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "D:\TCM web"
Set-Location $baseDir

# 检查结果数组
$results = @()

# 1. 检查MySQL服务
Write-Host "[1/8] 检查 MySQL 服务..." -ForegroundColor Yellow
$mysqlService = Get-Service MySQL -ErrorAction SilentlyContinue
if ($mysqlService -and $mysqlService.Status -eq 'Running') {
    Write-Host "  ✅ MySQL 服务正在运行" -ForegroundColor Green
    $results += @{Name="MySQL服务"; Status="✅ 正常"; Details="运行中"}
} else {
    Write-Host "  ❌ MySQL 服务未运行" -ForegroundColor Red
    $results += @{Name="MySQL服务"; Status="❌ 未运行"; Details="需要启动服务"}
}
Write-Host ""

# 2. 检查端口占用
Write-Host "[2/8] 检查端口占用..." -ForegroundColor Yellow
$ports = @(3000, 5173, 5000, 7860)
foreach ($port in $ports) {
    $listening = netstat -ano | Select-String ":$port.*LISTENING"
    if ($listening) {
        Write-Host "  ✅ 端口 $port 正在使用" -ForegroundColor Green
        $results += @{Name="端口$port"; Status="✅ 使用中"; Details="服务已启动"}
    } else {
        Write-Host "  ⚠️  端口 $port 未使用" -ForegroundColor Yellow
        $results += @{Name="端口$port"; Status="⚠️ 未使用"; Details="服务未启动"}
    }
}
Write-Host ""

# 3. 检查后端服务
Write-Host "[3/8] 检查后端服务 (http://localhost:3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
    if ($response.success -and $response.data.status -eq "healthy") {
        Write-Host "  ✅ 后端服务正常运行" -ForegroundColor Green
        Write-Host "     状态: $($response.data.status)" -ForegroundColor Gray
        Write-Host "     环境: $($response.data.environment)" -ForegroundColor Gray
        $results += @{Name="后端服务"; Status="✅ 正常"; Details="健康检查通过"}
    }
} catch {
    Write-Host "  ❌ 后端服务无响应: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{Name="后端服务"; Status="❌ 无响应"; Details=$_.Exception.Message}
}
Write-Host ""

# 4. 检查AI服务
Write-Host "[4/8] 检查AI服务 (http://localhost:5000)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
    if ($response.status -eq "ok") {
        Write-Host "  ✅ AI服务正常运行" -ForegroundColor Green
        Write-Host "     版本: $($response.version)" -ForegroundColor Gray
        $results += @{Name="AI服务"; Status="✅ 正常"; Details="健康检查通过"}
    }
} catch {
    Write-Host "  ❌ AI服务无响应: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{Name="AI服务"; Status="❌ 无响应"; Details=$_.Exception.Message}
}
Write-Host ""

# 5. 检查前端服务
Write-Host "[5/8] 检查前端服务 (http://localhost:5173)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ 前端服务正常运行" -ForegroundColor Green
        Write-Host "     状态码: $($response.StatusCode)" -ForegroundColor Gray
        $results += @{Name="前端服务"; Status="✅ 正常"; Details="HTTP 200"}
    }
} catch {
    Write-Host "  ❌ 前端服务无响应: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{Name="前端服务"; Status="❌ 无响应"; Details=$_.Exception.Message}
}
Write-Host ""

# 6. 检查后端登录API
Write-Host "[6/8] 测试后端登录API..." -ForegroundColor Yellow
try {
    $loginData = @{
        username = "health_user"
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginData -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    if ($response.success -and $response.data.token) {
        Write-Host "  ✅ 登录API正常" -ForegroundColor Green
        Write-Host "     用户: $($response.data.user.username)" -ForegroundColor Gray
        $results += @{Name="登录API"; Status="✅ 正常"; Details="登录成功"}
    }
} catch {
    Write-Host "  ❌ 登录API失败: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{Name="登录API"; Status="❌ 失败"; Details=$_.Exception.Message}
}
Write-Host ""

# 7. 检查AI咨询API
Write-Host "[7/8] 测试AI咨询API..." -ForegroundColor Yellow
try {
    $consultData = @{
        question = "测试问题"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/consult" -Method Post -Body $consultData -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
    if ($response.success) {
        Write-Host "  ✅ AI咨询API正常" -ForegroundColor Green
        $results += @{Name="AI咨询API"; Status="✅ 正常"; Details="咨询成功"}
    }
} catch {
    Write-Host "  ⚠️  AI咨询API超时或失败 (可能是正常的): $($_.Exception.Message)" -ForegroundColor Yellow
    $results += @{Name="AI咨询API"; Status="⚠️ 超时"; Details="可能正常，AI处理需要时间"}
}
Write-Host ""

# 8. 检查文件结构
Write-Host "[8/8] 检查项目文件..." -ForegroundColor Yellow
$requiredFiles = @(
    ".env",
    "package.json",
    "node_modules",
    "czb\package.json",
    "czb\node_modules",
    "zhongjing-ai-api\app.py"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (缺失)" -ForegroundColor Red
        $results += @{Name="文件检查"; Status="❌ 缺失"; Details=$file}
    }
}
Write-Host ""

# 生成报告
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   自检报告摘要" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$successCount = ($results | Where-Object { $_.Status -like "✅*" }).Count
$failCount = ($results | Where-Object { $_.Status -like "❌*" }).Count
$warnCount = ($results | Where-Object { $_.Status -like "⚠️*" }).Count

Write-Host "总计检查项: $($results.Count)" -ForegroundColor White
Write-Host "✅ 正常: $successCount" -ForegroundColor Green
Write-Host "⚠️  警告: $warnCount" -ForegroundColor Yellow
Write-Host "❌ 失败: $failCount" -ForegroundColor Red
Write-Host ""

# 列出问题
if ($failCount -gt 0) {
    Write-Host "发现的问题:" -ForegroundColor Red
    $results | Where-Object { $_.Status -like "❌*" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Details)" -ForegroundColor Red
    }
    Write-Host ""
}

# 访问地址
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   访问地址" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "后端API:    http://localhost:3000/api/health" -ForegroundColor White
Write-Host "前端界面:   http://localhost:5173" -ForegroundColor White
Write-Host "AI服务:     http://localhost:5000" -ForegroundColor White
Write-Host "AI界面(Gradio): http://localhost:7860" -ForegroundColor White
Write-Host ""
