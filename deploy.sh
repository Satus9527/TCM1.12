#!/bin/bash
# TCM Platform 部署脚本
# 用途: 自动化部署流程（更新代码、重启服务）

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
APP_DIR="/var/www/tcm-backend"
APP_NAME="tcm-backend"

echo "==========================================="
echo "🚀 TCM Platform 部署脚本"
echo "==========================================="

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在项目根目录执行此脚本${NC}"
    exit 1
fi

# 步骤 1: 更新代码
echo ""
echo -e "${YELLOW}[1/4] 更新代码...${NC}"
cd "$APP_DIR"
git fetch origin
git pull origin main  # 或 master，根据您的分支名调整
echo -e "${GREEN}✅ 代码已更新${NC}"

# 步骤 2: 安装依赖
echo ""
echo -e "${YELLOW}[2/4] 安装依赖...${NC}"
npm install --production
echo -e "${GREEN}✅ 依赖已安装${NC}"

# 步骤 3: 运行数据库迁移（如果需要）
echo ""
read -p "是否运行数据库迁移？ (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}运行数据库迁移...${NC}"
    npm run db:migrate
    echo -e "${GREEN}✅ 数据库迁移已完成${NC}"
fi

# 步骤 4: 重启服务
echo ""
echo -e "${YELLOW}[3/4] 重启后端服务...${NC}"
pm2 restart "$APP_NAME"
sleep 3

# 检查服务状态
echo ""
echo -e "${YELLOW}[4/4] 检查服务状态...${NC}"
pm2 status "$APP_NAME"

# 显示最近日志
echo ""
echo -e "${GREEN}最近日志:${NC}"
pm2 logs "$APP_NAME" --lines 20 --nostream

echo ""
echo "==========================================="
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "==========================================="

echo ""
echo "常用命令:"
echo "  pm2 logs $APP_NAME     # 查看实时日志"
echo "  pm2 status             # 查看所有服务状态"
echo "  pm2 monit              # 性能监控"
echo "  pm2 restart $APP_NAME  # 重启服务"
echo ""

