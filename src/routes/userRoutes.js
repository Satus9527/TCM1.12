const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * 用户相关路由
 */
router.use(authenticateToken);

/**
 * @route   GET /api/user/info
 * @desc    获取当前登录用户的详细信息
 * @access  Private
 */
router.get('/info', userController.getUserInfo);

/**
 * @route   GET /api/user/stats
 * @desc    获取用户的统计数据（Dashboard页面展示用）
 * @access  Private
 */
router.get('/stats', userController.getUserStats);

/**
 * @route   GET /api/user/activities
 * @desc    获取用户的近期活动记录
 * @access  Private
 */
router.get('/activities', userController.getUserActivities);

/**
 * @route   GET /api/user/tips
 * @desc    获取今日提示
 * @access  Private
 */
router.get('/tips', userController.getTodayTips);

module.exports = router;
