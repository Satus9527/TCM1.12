const logger = require('../utils/logger');

/**
 * 全局错误处理中间件
 * 必须放置在所有路由和中间件之后
 */
const errorHandler = (err, req, res, next) => {
  // 记录详细错误信息
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.user_id : 'anonymous',
    correlationId: req.id
  });

  // 设置默认状态码和错误消息
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'Internal Server Error';
  let errorCode = err.code || 'INTERNAL_ERROR';

  // 处理特定类型的错误
  
  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = err.errors.map(e => e.message).join(', ');
  }
  
  // Sequelize 唯一约束错误
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    errorCode = 'DUPLICATE_ERROR';
    errorMessage = 'Resource already exists';
  }
  
  // Sequelize 外键约束错误
  else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    errorCode = 'FOREIGN_KEY_ERROR';
    errorMessage = 'Invalid reference to related resource';
  }
  
  // JWT 错误
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    errorMessage = 'Invalid authentication token';
  }
  
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    errorMessage = 'Authentication token has expired';
  }

  // 自定义业务错误（带 statusCode 属性的错误）
  else if (err.statusCode) {
    statusCode = err.statusCode;
    errorCode = err.code || 'BUSINESS_ERROR';
  }

  // 发送符合规范的 JSON 错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { details: err.stack })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    correlationId: req.id
  });
};

module.exports = errorHandler;

