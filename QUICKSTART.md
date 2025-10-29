# 快速开始指南

这是最快速的项目启动方法，适合急于体验项目的开发者。

## 前置条件

确保已安装：
- Node.js v18.x
- MySQL 8.0+
- Git

## 5 分钟快速启动

### 1. 克隆并安装（1 分钟）

```bash
cd "D:\TCM web"
npm install
```

### 2. 创建 .env 文件（30 秒）

在项目根目录创建 `.env` 文件：

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# 或手动创建 .env 文件，内容如下：
```

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=tcm_platform

JWT_SECRET=请使用至少32位的随机字符串替换这里
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

REDIS_HOST=localhost
REDIS_PORT=6379

E1_RECOMMEND_URL=http://localhost:5001/recommend/formula
E1_ANALYZE_URL=http://localhost:5001/analyze/composition
E1_HEALTH_URL=http://localhost:5001/health
E1_TIMEOUT_MS=5000

LOG_LEVEL=info
```

**重要**: 修改 `DB_PASSWORD` 和 `JWT_SECRET`！

### 3. 创建数据库（30 秒）

```bash
# 打开 MySQL 命令行
mysql -u root -p

# 在 MySQL 中执行
CREATE DATABASE tcm_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. 运行迁移和种子数据（1 分钟）

```bash
# 运行数据库迁移
npm run db:migrate

# 填充演示数据
npm run db:seed
```

### 5. 启动服务器（10 秒）

```bash
npm run dev
```

## 验证安装

### 测试健康检查端点

打开浏览器或使用 curl：

```bash
# 浏览器访问
http://localhost:3000/api/health

# 或使用 curl
curl http://localhost:3000/api/health
```

预期响应：
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "...",
    "uptime": 1.234,
    "environment": "development"
  }
}
```

### 测试账号

系统已预设 3 个测试账号，密码均为 `password123`：

| 用户名 | 角色 | 邮箱 |
|--------|------|------|
| health_user | 养生爱好者 | health@example.com |
| student_wang | 学生 | student@example.com |
| teacher_li | 教师 | teacher@example.com |

## 下一步

### 开发建议

1. **查看项目文档**
   - [README.md](./README.md) - 完整项目文档
   - [SETUP.md](./SETUP.md) - 详细安装指南
   - [PROJECT_STATUS.md](./PROJECT_STATUS.md) - 项目状态

2. **开始开发**
   - 在 `src/controllers/` 添加控制器
   - 在 `src/services/` 添加业务逻辑
   - 在 `src/routes/` 添加路由

3. **使用 API 测试工具**
   - Postman
   - VS Code REST Client
   - Insomnia

### 常用命令

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start

# 数据库重置（清空并重新填充）
npm run db:reset

# 查看数据库迁移状态
npx sequelize-cli db:migrate:status
```

## 故障排除

### 问题 1: 数据库连接失败

**症状**: `ECONNREFUSED` 或 `ER_ACCESS_DENIED_ERROR`

**解决**:
1. 确认 MySQL 服务正在运行
2. 检查 `.env` 中的数据库凭据
3. 确认数据库 `tcm_platform` 已创建

### 问题 2: 端口被占用

**症状**: `EADDRINUSE: address already in use :::3000`

**解决**:
```bash
# Windows
netstat -ano | findstr :3000
# 记下 PID，然后终止进程
taskkill /PID <PID号> /F

# 或在 .env 中更改端口
PORT=3001
```

### 问题 3: 迁移失败

**症状**: Sequelize 迁移错误

**解决**:
```bash
# 撤销并重新运行
npm run db:migrate:undo
npm run db:migrate
```

## 需要帮助？

1. 查看 [SETUP.md](./SETUP.md) 的常见问题部分
2. 检查日志文件: `logs/error.log` 和 `logs/combined.log`
3. 联系开发团队

---

**恭喜！** 🎉 您的 TCM Platform Backend 现在已经运行了！

