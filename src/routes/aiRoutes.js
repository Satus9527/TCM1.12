const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * AI相关路由
 */
router.use(authenticateToken);

/**
 * @route   POST /api/consult
 * @desc    接收用户提交的症状信息，返回方剂推荐及相关分析结果
 * @access  Private
 */
router.post('/consult', aiController.consult);

module.exports = router;
