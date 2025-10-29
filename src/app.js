const express = require('express');
const addRequestId = require('express-request-id')();
const config = require('../config');
const logger = require('./utils/logger');
const db = require('./models');

// 导入中间件
const corsMiddleware = require('./middlewares/corsConfig');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

// 导入路由
const indexRoutes = require('./routes');

// 创建 Express 应用
const app = express();

// ============ 全局中间件 ============

// 1. Correlation ID (必须在最前面)
app.use(addRequestId);

// 2. CORS
app.use(corsMiddleware);

// 3. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. 请求日志记录
app.use(requestLogger);

// ============ 路由挂载 ============

// 基础路由
app.use('/api', indexRoutes);

// 认证路由 (待实现)
// app.use('/api/auth', authRoutes);

// 药材路由 (待实现)
// app.use('/api/medicines', medicineRoutes);

// 方剂路由 (待实现)
// app.use('/api/formulas', formulaRoutes);

// 用户路由 (待实现)
// app.use('/api/users', userRoutes);

// 收藏路由 (待实现)
// app.use('/api/collections', collectionRoutes);

// 模拟路由 (待实现)
// app.use('/api/simulations', simulationRoutes);

// 文件路由 (待实现)
// app.use('/api/files', fileRoutes);

// AI 服务路由 (待实现)
// app.use('/api/ai', aiRoutes);

// ============ 404 处理 ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found'
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// ============ 全局错误处理 (必须在最后) ============
app.use(errorHandler);

// ============ 数据库连接与服务器启动 ============

const startServer = async () => {
  try {
    // 测试数据库连接
    await db.sequelize.authenticate();
    logger.info('Database connection has been established successfully');

    // 在开发环境中同步模型（生产环境使用迁移）
    if (config.env === 'development') {
      // 注意：sync({ alter: true }) 会修改现有表结构
      // 在生产环境中应该使用迁移而不是 sync
      // await db.sequelize.sync({ alter: true });
      logger.info('Database models are ready (use migrations for schema changes)');
    }

    // 启动服务器
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${config.env} mode`);
      console.log(`\n🚀 TCM Platform Backend Server`);
      console.log(`📍 Environment: ${config.env}`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log(`\n✨ Server started successfully!\n`);
    });

  } catch (error) {
    logger.error('Unable to start server:', error);
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await db.sequelize.close();
  logger.info('Database connection closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await db.sequelize.close();
  logger.info('Database connection closed');
  process.exit(0);
});

// 启动服务器
startServer();

module.exports = app;

