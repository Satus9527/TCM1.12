const { User, RefreshToken } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hashUtils');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');
const logger = require('../utils/logger');
const crypto = require('crypto');
const redisClient = require('../utils/redisClient');

class AuthService {
  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   * @returns {Promise<Object>} 注册成功的用户信息和 token
   */
  async register(userData) {
    const { username, password, role, email, phone } = userData;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      const error = new Error('用户名已存在');
      error.statusCode = 409;
      error.code = 'USERNAME_EXISTS';
      throw error;
    }

    // 检查邮箱是否已存在（如果提供了邮箱）
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        const error = new Error('邮箱已被使用');
        error.statusCode = 409;
        error.code = 'EMAIL_EXISTS';
        throw error;
      }
    }

    // 哈希密码
    const password_hash = await hashPassword(password);

    // 创建用户
    const user = await User.create({
      username,
      password_hash,
      role,
      email,
      phone
    });

    logger.info('User registered successfully', { userId: user.user_id, username });

    // 生成 tokens
    const accessToken = generateAccessToken({
      user_id: user.user_id,
      username: user.username,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      user_id: user.user_id
    });

    // 保存 refresh token 到数据库
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

    await RefreshToken.create({
      user_id: user.user_id,
      token: refreshToken,
      expires_at: expiresAt
    });

    return {
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone
      },
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.username - 用户名（可选）
   * @param {string} credentials.email - 邮箱（可选）
   * @param {string} credentials.password - 密码
   * @returns {Promise<Object>} 登录成功的用户信息和 token
   */
  async login({ username, email, password }) {
    // 查找用户（支持用户名或邮箱登录）
    const whereClause = username ? { username } : { email };
    const user = await User.findOne({ where: whereClause });
    if (!user) {
      const error = new Error('用户名或密码错误');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      const error = new Error('用户名或密码错误');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    logger.info('User logged in successfully', { userId: user.user_id, username });

    // 生成 tokens
    const accessToken = generateAccessToken({
      user_id: user.user_id,
      username: user.username,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      user_id: user.user_id
    });

    // 删除该用户的旧 refresh token（避免重复登录时的唯一性约束冲突）
    await RefreshToken.destroy({
      where: { user_id: user.user_id }
    });

    // 保存新的 refresh token 到数据库
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.user_id,
      token: refreshToken,
      expires_at: expiresAt
    });

    return {
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url
      },
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  /**
   * 刷新访问令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<Object>} 新的访问令牌和刷新令牌
   */
  async refreshAccessToken(refreshToken) {
    // 查找 refresh token
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!tokenRecord) {
      const error = new Error('无效的刷新令牌');
      error.statusCode = 401;
      error.code = 'INVALID_REFRESH_TOKEN';
      throw error;
    }

    // 检查是否过期
    if (new Date() > tokenRecord.expires_at) {
      await tokenRecord.destroy();
      const error = new Error('刷新令牌已过期');
      error.statusCode = 401;
      error.code = 'REFRESH_TOKEN_EXPIRED';
      throw error;
    }

    const user = tokenRecord.user;

    // 生成新的 tokens
    const newAccessToken = generateAccessToken({
      user_id: user.user_id,
      username: user.username,
      role: user.role
    });

    const newRefreshToken = generateRefreshToken({
      user_id: user.user_id
    });

    // 删除旧的 refresh token
    await tokenRecord.destroy();

    // 保存新的 refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.user_id,
      token: newRefreshToken,
      expires_at: expiresAt
    });

    logger.info('Access token refreshed', { userId: user.user_id });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * 用户登出
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<void>}
   */
  async logout(refreshToken) {
    if (!refreshToken) {
      return;
    }

    // 删除 refresh token
    const deleted = await RefreshToken.destroy({
      where: { token: refreshToken }
    });

    if (deleted > 0) {
      logger.info('User logged out successfully');
    }
  }

  /**
   * 获取用户信息
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 用户信息
   */
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'username', 'role', 'email', 'phone', 'avatar_url', 'created_at']
    });

    if (!user) {
      const error = new Error('用户不存在');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return user;
  }

  /**
   * 生成 WebSocket 一次性票据
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 票据信息
   */
  async generateWebSocketTicket(userId) {
    // 生成随机票据（32字节，转为hex字符串）
    const ticket = crypto.randomBytes(32).toString('hex');

    // 存储票据到 Redis，TTL 30秒
    const ttl = 30; // 秒
    const key = `ws_ticket:${ticket}`;

    await redisClient.set(key, userId, ttl);

    logger.info('WebSocket ticket generated', { userId, ticket: ticket.substring(0, 8) + '...' });

    return {
      ticket,
      expires_in: ttl,
      expires_at: new Date(Date.now() + ttl * 1000).toISOString()
    };
  }

  /**
   * 验证 WebSocket 票据
   * @param {string} ticket - 票据
   * @returns {Promise<string|null>} 用户ID 或 null
   */
  async verifyWebSocketTicket(ticket) {
    const key = `ws_ticket:${ticket}`;

    // 从 Redis 获取用户ID
    const userId = await redisClient.get(key);

    if (userId) {
      // 票据使用后立即删除（一次性使用）
      await redisClient.del(key);
      logger.info('WebSocket ticket verified and consumed', { userId });
    }

    return userId;
  }
}

module.exports = new AuthService();

