const express = require('express');
const { default: addRequestId } = require('express-request-id');
const config = require('../config');
const logger = require('./utils/logger');
const db = require('./models');

// 导入中间件
const corsMiddleware = require('./middlewares/corsConfig');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

// 导入路由
const indexRoutes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const formulaController = require('./controllers/formulaController');
const medicineController = require('./controllers/medicineController');
const formulaRoutes = require('./routes/formulaRoutes');
const collectionRoutes = require('./routes/collectionRoutes');

// 创建 Express 应用
const app = express();

// ============ 全局中间件 ============

// 1. Correlation ID (必须在最前面)
app.use(addRequestId());

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

// 认证路由
app.use('/api/auth', authRoutes);

// 药材路由
app.use('/api/medicines', medicineRoutes);

// 药材分类路由
app.get('/api/medicine-categories', medicineController.getCategories);

// 方剂路由
app.use('/api/formulas', formulaRoutes);

// 收藏路由
app.use('/api/collections', collectionRoutes);

// 知识库路由
const knowledgeRoutes = require('./routes/knowledgeRoutes');
app.use('/api/knowledge', knowledgeRoutes);

// AI推荐路由
const recommendationRoutes = require('./routes/recommendationRoutes');
app.use('/api/recommend', recommendationRoutes);

// 个性化内容路由（收藏、模拟方案）
const contentRoutes = require('./routes/contentRoutes');
app.use('/api/content', contentRoutes);

// 文件管理路由（上传、列表、删除）
const fileRoutes = require('./routes/fileRoutes');
app.use('/api/files', fileRoutes);

// 用户路由 (待实现)
// app.use('/api/users', userRoutes);

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

// 导入 WebSocket 服务
const { initializeWebSocket, closeAllConnections, getConnectionStats } = require('./services/simulationSocketService');

// 存储 HTTP server 实例
let httpServer = null;

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

    // 启动 HTTP 服务器
    const PORT = config.port;
    httpServer = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${config.env} mode`);
      console.log(`\n🚀 TCM Platform Backend Server`);
      console.log(`📍 Environment: ${config.env}`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}/api/simulation`);
      console.log(`\n✨ Server started successfully!\n`);
    });

    // 初始化 WebSocket 服务器
    initializeWebSocket(httpServer);
    logger.info('WebSocket server initialized successfully');

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
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received: closing servers`);
  
  try {
    // 1. 关闭所有 WebSocket 连接
    closeAllConnections();
    logger.info('All WebSocket connections closed');
    
    // 2. 关闭 HTTP server
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      logger.info('HTTP server closed');
    }
    
    // 3. 关闭数据库连接
    await db.sequelize.close();
    logger.info('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 启动服务器
startServer();

module.exports = app;

