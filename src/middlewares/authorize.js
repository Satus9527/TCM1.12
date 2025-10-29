const logger = require('../utils/logger');

/**
 * 授权中间件工厂函数
 * 检查用户是否具有指定角色
 * @param {...string} allowedRoles - 允许的角色列表
 * @returns {Function} Express 中间件函数
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 确保用户已通过认证
    if (!req.user) {
      logger.warn('Authorization check failed - no user', {
        correlationId: req.id,
        url: req.originalUrl
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // 检查用户角色
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization check failed - insufficient permissions', {
        correlationId: req.id,
        userId: req.user.user_id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        url: req.originalUrl
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to access this resource'
        }
      });
    }

    logger.debug('Authorization check passed', {
      correlationId: req.id,
      userId: req.user.user_id,
      userRole: req.user.role
    });

    next();
  };
};

module.exports = authorize;

