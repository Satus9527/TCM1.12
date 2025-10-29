# 项目初始化与设置指南

本文档详细说明了如何从零开始设置和运行本项目。

## 环境变量配置

由于 `.env` 文件不会被提交到版本控制系统，您需要手动创建它。

### 创建 .env 文件

在项目根目录创建 `.env` 文件，内容如下：

```env
# 环境设置
NODE_ENV=development
PORT=3000

# 数据库配置 (D1, D2, D3 - MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_database_password_here
DB_NAME=tcm_platform

# Redis 配置 (D4)
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=your_redis_password_here  # 如果 Redis 设置了密码

# JWT 配置
# 重要：请生成一个强密码替换下面的值
JWT_SECRET=please_change_this_to_a_very_strong_random_secret_key_min_32_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# AI 服务配置 (E1)
E1_RECOMMEND_URL=http://localhost:5001/recommend/formula
E1_ANALYZE_URL=http://localhost:5001/analyze/composition
E1_HEALTH_URL=http://localhost:5001/health
E1_TIMEOUT_MS=5000

# 日志级别
LOG_LEVEL=info

# 前端 URL（用于 CORS）
FRONTEND_URL=http://localhost:8080
```

### 安全提示

1. **JWT_SECRET**: 这是最重要的安全配置，请使用至少 32 字符的随机字符串。可以使用以下命令生成：

```bash
# 使用 Node.js 生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **数据库密码**: 使用强密码，不要使用默认密码。

3. **生产环境**: 在生产环境中，确保 `NODE_ENV=production`。

## 完整安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd tcm-platform-backend
```

### 2. 安装 Node.js（使用 nvm）

```bash
# 安装 nvm（如果还没有安装）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端后，使用项目指定的 Node.js 版本
nvm install
nvm use
```

### 3. 安装项目依赖

```bash
npm install
```

### 4. 设置 MySQL 数据库

#### 启动 MySQL 服务

```bash
# macOS
brew services start mysql

# Linux (Ubuntu/Debian)
sudo systemctl start mysql

# Windows
# 通过服务管理器或 MySQL Workbench 启动
```

#### 创建数据库

```bash
mysql -u root -p
```

在 MySQL 命令行中执行：

```sql
CREATE DATABASE tcm_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 可选：创建专用数据库用户
CREATE USER 'tcm_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON tcm_platform.* TO 'tcm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. 设置 Redis（可选）

```bash
# macOS
brew install redis
brew services start redis

# Linux (Ubuntu/Debian)
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# 下载并安装 Redis for Windows
```

### 6. 配置环境变量

按照上面的"环境变量配置"部分创建 `.env` 文件。

### 7. 运行数据库迁移

```bash
# 运行所有迁移，创建表结构
npm run db:migrate
```

### 8. 填充种子数据

```bash
# 填充演示数据
npm run db:seed
```

### 9. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 或者生产模式
npm start
```

### 10. 验证安装

访问以下 URL 验证服务是否正常运行：

```bash
# 健康检查
curl http://localhost:3000/api/health

# 应该返回：
# {
#   "success": true,
#   "data": {
#     "status": "healthy",
#     "timestamp": "...",
#     "uptime": ...,
#     "environment": "development"
#   }
# }
```

## 常见问题

### 1. 数据库连接失败

**问题**: `ECONNREFUSED` 或 `ER_ACCESS_DENIED_ERROR`

**解决方案**:
- 确认 MySQL 服务正在运行
- 检查 `.env` 中的数据库凭据是否正确
- 确认数据库已创建
- 检查用户权限

### 2. 端口已被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:
```bash
# 找到占用端口的进程
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000

# 终止进程或在 .env 中更改端口号
```

### 3. Sequelize 迁移失败

**问题**: 迁移执行出错

**解决方案**:
```bash
# 撤销所有迁移
npm run db:migrate:undo

# 重新运行迁移
npm run db:migrate

# 如果仍有问题，重置数据库
npm run db:reset
```

### 4. 模块未找到

**问题**: `Error: Cannot find module '...'`

**解决方案**:
```bash
# 删除 node_modules 和锁文件
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

## 开发工具推荐

### VS Code 扩展

- ESLint
- Prettier
- MySQL
- REST Client
- GitLens

### 数据库管理工具

- MySQL Workbench
- DBeaver
- TablePlus
- phpMyAdmin

### API 测试工具

- Postman
- Insomnia
- VS Code REST Client

## 下一步

安装完成后，您可以：

1. 查看 [README.md](./README.md) 了解项目概览
2. 查看 API 文档了解可用接口
3. 开始开发新功能

## 获取帮助

如遇到问题，请：

1. 检查本文档的"常见问题"部分
2. 查看项目的 Issues
3. 联系开发团队

