const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { medicineValidation } = require('../middlewares/validators/medicineValidator');

/**
 * @route   GET /api/medicines
 * @desc    获取药材列表
 * @access  Public
 */
router.get('/', medicineController.getMedicines);

/**
 * @route   GET /api/medicines/:id
 * @desc    获取药材详情
 * @access  Public
 */
router.get('/:id', medicineController.getMedicineById);

/**
 * @route   POST /api/medicines
 * @desc    创建药材
 * @access  Private (仅教师)
 */
router.post(
  '/',
  authenticate,
  authorize('teacher'),
  medicineValidation,
  medicineController.createMedicine
);

/**
 * @route   PUT /api/medicines/:id
 * @desc    更新药材
 * @access  Private (仅教师)
 */
router.put(
  '/:id',
  authenticate,
  authorize('teacher'),
  medicineValidation,
  medicineController.updateMedicine
);

/**
 * @route   DELETE /api/medicines/:id
 * @desc    删除药材
 * @access  Private (仅教师)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('teacher'),
  medicineController.deleteMedicine
);

module.exports = router;

