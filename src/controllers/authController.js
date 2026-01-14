const authService = require('../services/authService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class AuthController {
  /**
   * 用户注册
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '输入验证失败',
            details: errors.array()
          }
        });
      }

      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        data: result,
        message: '注册成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 用户登录
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '输入验证失败',
            details: errors.array()
          }
        });
      }

      const { username, email, phone, password } = req.body;
      const result = await authService.login({ username, email, phone, password });

      res.json({
        success: true,
        data: result,
        message: '登录成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 刷新访问令牌
   * POST /api/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: '缺少刷新令牌'
          }
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        data: result,
        message: '令牌刷新成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 用户登出
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      await authService.logout(refreshToken);

      res.json({
        success: true,
        message: '登出成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取当前用户信息
   * GET /api/auth/profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserProfile(req.user.user_id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 生成 WebSocket 连接票据
   * POST /api/auth/ws-ticket
   */
  async generateWsTicket(req, res, next) {
    try {
      const userId = req.user.user_id;

      const ticketInfo = await authService.generateWebSocketTicket(userId);

      res.json({
        success: true,
        data: ticketInfo,
        message: 'WebSocket票据生成成功'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

