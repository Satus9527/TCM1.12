const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * 处方相关路由
 */
router.post('/analyze', prescriptionController.analyzePrescription);

// 需要认证的路由
router.use(authenticateToken);

/**
 * 获取用户的处方列表
 * @route   GET /api/prescriptions
 * @desc    获取当前用户的处方列表
 * @access  Private
 */
router.get('/', prescriptionController.getUserPrescriptions);

module.exports = router;
