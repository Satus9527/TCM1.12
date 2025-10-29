# TCM Platform Backend - 中医药方平台后端

## 项目简介

基于 Node.js + Express + MySQL 的中医药方平台后端服务，提供药材、方剂、用户管理等功能。

## 技术栈

- **运行时**: Node.js v18.x (LTS)
- **框架**: Express.js
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize
- **缓存**: Redis
- **认证**: JWT (jsonwebtoken)
- **日志**: Winston
- **进程管理**: PM2

## 项目结构

```
.
├── config/              # 配置文件
│   ├── index.js        # 主配置
│   └── database.js     # 数据库配置
├── src/
│   ├── controllers/    # 控制器层
│   ├── middlewares/    # 中间件
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   └── corsConfig.js
│   ├── models/         # Sequelize 模型
│   │   ├── User.js
│   │   ├── Medicine.js
│   │   ├── Formula.js
│   │   └── ...
│   ├── routes/         # 路由定义
│   ├── services/       # 业务逻辑层
│   ├── utils/          # 工具函数
│   │   ├── logger.js
│   │   ├── jwtUtils.js
│   │   └── hashUtils.js
│   └── app.js          # 应用入口
├── migrations/         # 数据库迁移
├── seeders/           # 种子数据
├── logs/              # 日志文件
├── .env               # 环境变量（不提交）
├── .env.example       # 环境变量示例
├── .nvmrc             # Node.js 版本锁定
└── package.json       # 项目配置
```

## 快速开始

### 1. 环境要求

- Node.js v18.x
- MySQL 8.0+
- Redis (可选)
- npm 或 yarn

### 2. 安装依赖

```bash
# 使用 nvm 切换到正确的 Node.js 版本
nvm use

# 安装依赖
npm install
```

### 3. 配置环境变量

复制 `.env.example` 创建 `.env` 文件，并根据实际情况修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，至少需要配置以下内容：

```env
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tcm_platform

# JWT 密钥（请使用强密码）
JWT_SECRET=your_very_strong_secret_key_here
```

### 4. 数据库设置

#### 创建数据库

```bash
mysql -u root -p
CREATE DATABASE tcm_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 运行迁移

```bash
npm run db:migrate
```

#### 填充种子数据

```bash
npm run db:seed
```

### 5. 启动服务

#### 开发模式（自动重启）

```bash
npm run dev
```

#### 生产模式

```bash
npm start
```

服务启动后访问：
- 主服务: http://localhost:3000
- 健康检查: http://localhost:3000/api/health

## 数据库管理

### 可用的数据库命令

```bash
# 运行迁移
npm run db:migrate

# 撤销所有迁移
npm run db:migrate:undo

# 运行种子数据
npm run db:seed

# 撤销种子数据
npm run db:seed:undo

# 重置数据库（清空 -> 迁移 -> 种子数据）
npm run db:reset

# 从备份恢复数据库
npm run db:restore
```

### 数据模型

系统包含以下数据模型：

1. **User** - 用户表
   - 角色: `health_follower`（养生爱好者）, `student`（学生）, `teacher`（教师）
   
2. **Medicine** - 药材表
   - 包含名称、性味、归经、功效等信息
   
3. **Formula** - 方剂表
   - 包含方剂名称、组成、功效、主治等信息
   
4. **FormulaComposition** - 方剂组成关系表
   - 关联方剂和药材，包含用量、角色等信息
   
5. **UserCollection** - 用户收藏表
   
6. **UserSimulation** - 用户模拟配方表
   
7. **UserFile** - 用户文件表
   
8. **RefreshToken** - 刷新令牌表

## API 文档

### 认证

所有需要认证的接口需要在请求头中携带 JWT Token：

```
Authorization: Bearer <your_token>
```

### 响应格式

#### 成功响应

```json
{
  "success": true,
  "data": { ... }
}
```

#### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "correlationId": "unique-request-id"
}
```

## 开发指南

### 添加新的路由

1. 在 `src/routes/` 创建路由文件
2. 在 `src/controllers/` 创建控制器
3. 在 `src/app.js` 中挂载路由

### 使用认证和授权

```javascript
const authenticate = require('./middlewares/authenticate');
const authorize = require('./middlewares/authorize');

// 需要认证
router.get('/profile', authenticate, controller.getProfile);

// 需要特定角色
router.post('/admin', authenticate, authorize('teacher'), controller.adminAction);
```

### 日志记录

```javascript
const logger = require('./utils/logger');

logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message', { error: err });
```

## 测试账号

系统预设了以下测试账号（密码均为 `password123`）：

- **养生爱好者**: `health_user`
- **学生**: `student_wang`
- **教师**: `teacher_li`

## 生产部署

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start src/app.js --name tcm-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs tcm-backend

# 重启
pm2 restart tcm-backend

# 停止
pm2 stop tcm-backend
```

### 环境变量

生产环境请确保设置：

```env
NODE_ENV=production
JWT_SECRET=<强密码>
DB_PASSWORD=<数据库密码>
```

## 安全建议

1. ✅ 使用强 JWT 密钥
2. ✅ 在生产环境中禁用详细错误信息
3. ✅ 定期更新依赖包
4. ✅ 使用 HTTPS
5. ✅ 限制 CORS 允许的源
6. ✅ 实施请求速率限制（建议添加）
7. ✅ 定期备份数据库

## 许可证

ISC

## 联系方式

如有问题，请联系开发团队。

