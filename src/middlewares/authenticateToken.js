const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../utils/logger');

/**
 * JWT 认证中间件
 * 验证传入请求 Authorization: Bearer <token> 头中的 JWT Access_Token
 * 
 * @description
 * - 验证 Token 签名和时效性
 * - 成功: 解码 Token Payload，附加到 req.user，调用 next()
 * - 失败: 返回 401 Unauthorized 响应
 * 
 * @param {Object} req - Express request 对象
 * @param {Object} res - Express response 对象
 * @param {Function} next - Express next 函数
 */
function authenticateToken(req, res, next) {
  try {
    // 1. 获取 Authorization Header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 提取 'Bearer <token>' 中的 token

    // 2. 检查 Token 是否存在
    if (token == null) {
      // Token 缺失
      logger.warn('访问令牌缺失', {
        correlationId: req.id,
        path: req.originalUrl,
        method: req.method
      });

      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        message: '访问令牌缺失。',
        path: req.originalUrl
      });
    }

    // 3. 验证 Token
    jwt.verify(token, config.jwt.secret, (err, decodedPayload) => {
      if (err) {
        // Token 无效或过期
        let errorMessage = '访问令牌无效。';
        let errorCode = 'INVALID_TOKEN';

        if (err.name === 'TokenExpiredError') {
          errorMessage = '访问令牌已过期。';
          errorCode = 'TOKEN_EXPIRED';
        } else if (err.name === 'JsonWebTokenError') {
          errorMessage = '访问令牌格式错误。';
          errorCode = 'MALFORMED_TOKEN';
        } else if (err.name === 'NotBeforeError') {
          errorMessage = '访问令牌尚未生效。';
          errorCode = 'TOKEN_NOT_ACTIVE';
        }

        // 记录详细错误供调试
        logger.warn('JWT 验证失败', {
          correlationId: req.id,
          error: err.name,
          message: err.message,
          path: req.originalUrl
        });

        return res.status(401).json({
          timestamp: new Date().toISOString(),
          status: 401,
          error: 'Unauthorized',
          message: errorMessage,
          code: errorCode,
          path: req.originalUrl
        });
      }

      // 4. Token 有效，附加用户信息到 request 对象
      // Payload 结构: { sub: userId, rol: role, username: username, ... }
      // 兼容两种格式：新格式 (sub, rol) 和旧格式 (user_id, role)
      const userId = decodedPayload.sub || decodedPayload.user_id;
      const userRole = decodedPayload.rol || decodedPayload.role;
      
      req.user = {
        id: userId,                                                 // 用户 ID (新格式)
        user_id: userId,                                            // 用户 ID (旧格式，向后兼容)
        role: userRole,                                             // 用户角色
        username: decodedPayload.username || decodedPayload.sub    // 用户名（可选）
      };

      logger.debug('用户认证成功', {
        correlationId: req.id,
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        path: req.originalUrl
      });

      // 5. 调用下一个中间件
      next();
    });
  } catch (error) {
    // 捕获意外错误
    logger.error('认证中间件异常', {
      correlationId: req.id,
      error: error.message,
      stack: error.stack,
      path: req.originalUrl
    });

    return res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      error: 'Internal Server Error',
      message: '服务器内部错误。',
      path: req.originalUrl
    });
  }
}

module.exports = authenticateToken;

