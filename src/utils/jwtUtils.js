const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * 生成访问令牌
 * @param {Object} payload - JWT 载荷数据
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiration
  });
};

/**
 * 生成刷新令牌
 * @param {Object} payload - JWT 载荷数据
 * @returns {string} JWT token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
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

