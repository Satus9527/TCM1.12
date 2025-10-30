const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * 生成访问令牌
 * @param {Object} payload - JWT 载荷数据
 * @param {string} payload.user_id - 用户ID
 * @param {string} payload.username - 用户名
 * @param {string} payload.role - 用户角色
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  // 使用标准 JWT 字段名
  // sub (Subject): 用户ID
  // rol (Role): 用户角色 (自定义声明)
  const standardPayload = {
    sub: payload.user_id || payload.sub,        // 用户ID (标准字段)
    rol: payload.role || payload.rol,           // 用户角色 (自定义字段)
    username: payload.username,                 // 用户名
    // 保留原始字段以保持向后兼容
    user_id: payload.user_id || payload.sub,
    role: payload.role || payload.rol
  };

  return jwt.sign(standardPayload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiration
  });
};

/**
 * 生成刷新令牌
 * @param {Object} payload - JWT 载荷数据
 * @param {string} payload.user_id - 用户ID
 * @returns {string} JWT token
 */
const generateRefreshToken = (payload) => {
  // Refresh Token 只包含最小必要信息
  const standardPayload = {
    sub: payload.user_id || payload.sub,        // 用户ID
    // 保留原始字段以保持向后兼容
    user_id: payload.user_id || payload.sub
  };

  return jwt.sign(standardPayload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiration
  });
};

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @returns {Object} 解码后的载荷
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};

