const logger = require('../utils/logger');

/**
 * 请求日志记录中间件
 * 记录每个请求的详细信息
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // 记录请求开始
  logger.info('Incoming request', {
    correlationId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    user: req.user ? req.user.user_id : 'anonymous'
  });

  // 监听响应完成事件
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    const logData = {
      correlationId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      user: req.user ? req.user.user_id : 'anonymous'
    };

    // 根据状态码选择日志级别
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', logData);
    } else {
      logger.info('Request completed successfully', logData);
    }
  });

  next();
};

module.exports = requestLogger;

