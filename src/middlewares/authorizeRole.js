const logger = require('../utils/logger');

/**
 * RBAC 授权中间件工厂函数
 * 基于 req.user.role 限制对特定路由的访问权限
 * 
 * @description
 * 实现为工厂函数，接收允许访问的角色作为参数，返回实际的 Express 中间件
 * 
 * @param {string | string[]} allowedRoles - 允许访问的角色 (单个字符串或字符串数组)
 * @returns {Function} Express 中间件函数
 * 
 * @example
 * // 单个角色
 * router.post('/upload', authenticateToken, authorizeRole('teacher'), uploadController);
 * 
 * // 多个角色
 * router.get('/collections', authenticateToken, authorizeRole(['health_follower', 'student']), getCollections);
 */
function authorizeRole(allowedRoles) {
  // 将单个角色字符串转换为数组，方便处理
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // 验证角色有效性
  const validRoles = ['health_follower', 'student', 'teacher'];
  const invalidRoles = roles.filter(role => !validRoles.includes(role));
  if (invalidRoles.length > 0) {
    console.warn(`警告: 授权中间件配置了无效角色: ${invalidRoles.join(', ')}`);
  }

  // 返回实际的中间件函数
  return (req, res, next) => {
    try {
      // 1. 安全检查：确保 authenticateToken 中间件已成功运行并附加了 req.user
      if (!req.user || !req.user.role) {
        // 如果 req.user 不存在，说明认证失败或未执行认证中间件
        logger.error('授权检查失败 - req.user 不存在', {
          correlationId: req.id,
          path: req.originalUrl,
          method: req.method,
          note: '请确保 authenticateToken 中间件在 authorizeRole 之前执行'
        });

        return res.status(403).json({
          timestamp: new Date().toISOString(),
          status: 403,
          error: 'Forbidden',
          message: '用户角色信息缺失。',
          path: req.originalUrl
        });
      }

      // 2. 检查用户角色是否在允许列表中
      const userRole = req.user.role;

      if (roles.includes(userRole)) {
        // 3. 角色匹配，允许访问
        logger.debug('授权检查通过', {
          correlationId: req.id,
          userId: req.user.id,
          userRole: userRole,
          allowedRoles: roles,
          path: req.originalUrl
        });

        next();
      } else {
        // 4. 角色不匹配，拒绝访问
        logger.warn('授权检查失败 - 权限不足', {
          correlationId: req.id,
          userId: req.user.id,
          userRole: userRole,
          allowedRoles: roles,
          path: req.originalUrl,
          method: req.method
        });

        return res.status(403).json({
          timestamp: new Date().toISOString(),
          status: 403,
          error: 'Forbidden',
          message: '无权访问此资源。',
          required_roles: roles,
          user_role: userRole,
          path: req.originalUrl
        });
      }
    } catch (error) {
      // 捕获意外错误
      logger.error('授权中间件异常', {
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
  };
}

module.exports = authorizeRole;

