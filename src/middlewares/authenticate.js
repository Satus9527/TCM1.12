const { verifyToken } = require('../utils/jwtUtils');
const logger = require('../utils/logger');

/**
 * 认证中间件
 * 验证 JWT token 并将用户信息附加到 req.user
 */
const authenticate = (req, res, next) => {
  try {
    // 从 Authorization 头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No authentication token provided'
        }
      });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 验证 token
    const decoded = verifyToken(token);
    
    // 将用户信息附加到请求对象
    req.user = {
      user_id: decoded.user_id,
      username: decoded.username,
      role: decoded.role
    };

    logger.debug('User authenticated', {
      correlationId: req.id,
      userId: req.user.user_id,
      username: req.user.username,
      role: req.user.role
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      correlationId: req.id,
      error: error.message
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      }
    });
  }
};

module.exports = authenticate;

