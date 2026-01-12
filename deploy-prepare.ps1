# TCM Platform 部署准备脚本
# 用途: 在 Windows 上准备部署文件，便于上传到 Linux 服务器

Write-Host "==========================================="
Write-Host "🚀 TCM Platform 部署准备" -ForegroundColor Cyan
Write-Host "==========================================="
Write-Host ""

# 检查关键文件
$requiredFiles = @(
    "package.json",
    "src/app.js",
    "ecosystem.config.js",
    "nginx-tcm-platform.conf",
    "deploy.sh",
    "🚀_生产部署指南_无Docker版.md"
)

Write-Host "📋 检查必需文件..." -ForegroundColor Yellow

$allExists = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file 缺失" -ForegroundColor Red
        $allExists = $false
    }
}

if (-not $allExists) {
    Write-Host ""
    Write-Host "❌ 部分文件缺失，请确保在项目根目录执行此脚本" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ 所有必需文件已就绪" -ForegroundColor Green
Write-Host ""

# 列出需要上传的文件
Write-Host "📦 需要上传到服务器的文件:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  核心文件:"
Write-Host "    - 整个项目目录 (src/, config/, migrations/, seeders/)"
Write-Host "    - package.json"
Write-Host "    - .nvmrc"
Write-Host ""
Write-Host "  配置文件:"
Write-Host "    - ecosystem.config.js"
Write-Host "    - nginx-tcm-platform.conf"
Write-Host "    - deploy.sh"
Write-Host ""
Write-Host "  部署文档:"
Write-Host "    - 🚀_生产部署指南_无Docker版.md"
Write-Host "    - 📖_部署快速参考.md"
Write-Host ""
Write-Host "  其他:"
Write-Host "    - .gitignore"
Write-Host ""

# 检查 .env 文件
Write-Host "🔐 环境变量检查:" -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  ✅ .env 文件存在" -ForegroundColor Green
    Write-Host "  ⚠️  注意: 需要手动在服务器上创建 .env 文件" -ForegroundColor Yellow
} else {
    Write-Host "  ⚠️  .env 文件不存在" -ForegroundColor Yellow
    Write-Host "  💡 提示: 请在服务器上根据部署指南创建 .env 文件" -ForegroundColor Cyan
}

Write-Host ""

# 提供部署选项
Write-Host "==========================================="
Write-Host "📋 下一步操作" -ForegroundColor Cyan
Write-Host "==========================================="
Write-Host ""
Write-Host "选择部署方式:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  方案1: 手动 FTP/SCP 上传" -ForegroundColor Green
Write-Host "    1. 使用 WinSCP、FileZilla 或其他 FTP 工具"
Write-Host "    2. 连接到您的 Linux 服务器"
Write-Host "    3. 上传整个项目目录"
Write-Host ""
Write-Host "  方案2: Git 克隆（推荐）" -ForegroundColor Green
Write-Host "    1. 确保代码已推送到 Git 仓库"
Write-Host "    2. 在服务器上执行:"
Write-Host "       cd /var/www && git clone YOUR_REPO tcm-backend"
Write-Host "       cd tcm-backend && nvm use"
Write-Host ""
Write-Host "  方案3: 使用部署脚本" -ForegroundColor Green
Write-Host "    1. 上传文件到服务器后"
Write-Host "    2. 在服务器上执行:"
Write-Host "       chmod +x deploy.sh"
Write-Host "       ./deploy.sh"
Write-Host ""

Write-Host "==========================================="
Write-Host "📖 参考文档" -ForegroundColor Cyan
Write-Host "==========================================="
Write-Host ""
Write-Host "  完整部署指南: 🚀_生产部署指南_无Docker版.md"
Write-Host "  快速参考: 📖_部署快速参考.md"
Write-Host "  文档索引: 📚_部署文档索引.md"
Write-Host ""

Write-Host "==========================================="
Write-Host "✅ 部署准备完成" -ForegroundColor Green
Write-Host "==========================================="
Write-Host ""

