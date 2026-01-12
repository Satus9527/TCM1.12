# MinIO 快速配置脚本
# 用于为 TCM 平台配置 MinIO 对象存储

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MinIO 配置脚本" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否安装
Write-Host "[1] 检查 Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✓ Docker 已安装" -ForegroundColor Green
} catch {
    Write-Host "✗ 未检测到 Docker" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 Docker Desktop:" -ForegroundColor Yellow
    Write-Host "  https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# 检查 MinIO 容器是否已存在
Write-Host "[2] 检查现有 MinIO 容器..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=minio" --format "{{.Names}}"
if ($existingContainer -eq "minio") {
    Write-Host "⚠ MinIO 容器已存在" -ForegroundColor Yellow
    
    $running = docker ps --filter "name=minio" --format "{{.Names}}"
    if ($running -eq "minio") {
        Write-Host "✓ MinIO 已在运行" -ForegroundColor Green
        Write-Host ""
        Write-Host "MinIO 服务信息:" -ForegroundColor Cyan
        Write-Host "  控制台: http://localhost:9001" -ForegroundColor White
        Write-Host "  API: http://localhost:9000" -ForegroundColor White
        Write-Host "  用户名: minioadmin" -ForegroundColor White
        Write-Host "  密码: minioadmin" -ForegroundColor White
        exit 0
    } else {
        Write-Host "启动现有容器..." -ForegroundColor Yellow
        docker start minio
        Write-Host "✓ MinIO 已启动" -ForegroundColor Green
    }
} else {
    Write-Host "[3] 创建并启动 MinIO 容器..." -ForegroundColor Yellow
    
    docker run -d `
        --name minio `
        -p 9000:9000 `
        -p 9001:9001 `
        -e "MINIO_ROOT_USER=minioadmin" `
        -e "MINIO_ROOT_PASSWORD=minioadmin" `
        minio/minio server /data --console-address ":9001"
    
    Write-Host "✓ MinIO 容器已创建并启动" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4] 等待服务就绪..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ MinIO 配置完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问信息:" -ForegroundColor Cyan
Write-Host "  控制台: http://localhost:9001" -ForegroundColor White
Write-Host "  API: http://localhost:9000" -ForegroundColor White
Write-Host "  用户名: minioadmin" -ForegroundColor White
Write-Host "  密码: minioadmin" -ForegroundColor White
Write-Host ""

# 读取当前 .env 文件
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "[5] 更新 .env 配置..." -ForegroundColor Yellow
    
    $envContent = Get-Content $envFile -Raw
    
    # 更新或添加 MinIO 配置
    $newConfig = @"

# MinIO 对象存储配置
D8_ENDPOINT=http://localhost:9000
D8_REGION=us-east-1
D8_BUCKET=tcm-platform-files
D8_ACCESS_KEY_ID=minioadmin
D8_SECRET_ACCESS_KEY=minioadmin
D8_FORCE_PATH_STYLE=true
"@
    
    # 检查是否已有 D8 配置
    if ($envContent -match "D8_ENDPOINT") {
        Write-Host "⚠ .env 中已有 D8 配置，请手动确认是否正确" -ForegroundColor Yellow
    } else {
        Add-Content -Path $envFile -Value $newConfig
        Write-Host "✓ 已添加 MinIO 配置到 .env" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ 未找到 .env 文件" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "  1. 访问 http://localhost:9001" -ForegroundColor White
Write-Host "  2. 登录 (minioadmin/minioadmin)" -ForegroundColor White
Write-Host "  3. 创建 bucket: tcm-platform-files" -ForegroundColor White
Write-Host "  4. 运行测试: node test-file-upload.js" -ForegroundColor White
Write-Host ""

