const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * 学习记录相关路由
 */
router.use(authenticateToken);

/**
 * @route   POST /api/learning/records
 * @desc    创建学习记录
 * @access  Private
 */
router.post('/records', learningController.createLearningRecord);

/**
 * @route   GET /api/learning/records
 * @desc    获取用户的学习记录列表
 * @access  Private
 */
router.get('/records', learningController.getLearningRecords);

/**
 * @route   GET /api/learning/records/:id
 * @desc    获取单个学习记录
 * @access  Private
 */
router.get('/records/:id', learningController.getLearningRecordById);

/**
 * @route   PUT /api/learning/records/:id
 * @desc    更新学习记录
 * @access  Private
 */
router.put('/records/:id', learningController.updateLearningRecord);

/**
 * @route   DELETE /api/learning/records/:id
 * @desc    删除学习记录
 * @access  Private
 */
router.delete('/records/:id', learningController.deleteLearningRecord);

module.exports = router;
