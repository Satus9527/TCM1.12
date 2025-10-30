const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const {
  registerValidation,
  loginValidation,
  refreshValidation
} = require('../middlewares/validators/authValidator');

/**
 * @route   POST /api/auth/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', registerValidation, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', loginValidation, authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    刷新访问令牌
 * @access  Public
 */
router.post('/refresh', refreshValidation, authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    用户登出
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   POST /api/auth/ws-ticket
 * @desc    生成WebSocket连接票据
 * @access  Private
 */
router.post('/ws-ticket', authenticate, authController.generateWsTicket);

module.exports = router;

