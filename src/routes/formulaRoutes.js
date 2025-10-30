const express = require('express');
const router = express.Router();
const formulaController = require('../controllers/formulaController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { formulaValidation } = require('../middlewares/validators/formulaValidator');

/**
 * @route   GET /api/formulas
 * @desc    获取方剂列表
 * @access  Public
 */
router.get('/', formulaController.getFormulas);

/**
 * @route   GET /api/formulas/:id
 * @desc    获取方剂详情（包含组成药材）
 * @access  Public
 */
router.get('/:id', formulaController.getFormulaById);

/**
 * @route   POST /api/formulas
 * @desc    创建方剂
 * @access  Private (仅教师)
 */
router.post(
  '/',
  authenticate,
  authorize('teacher'),
  formulaValidation,
  formulaController.createFormula
);

/**
 * @route   PUT /api/formulas/:id
 * @desc    更新方剂
 * @access  Private (仅教师)
 */
router.put(
  '/:id',
  authenticate,
  authorize('teacher'),
  formulaValidation,
  formulaController.updateFormula
);

/**
 * @route   DELETE /api/formulas/:id
 * @desc    删除方剂
 * @access  Private (仅教师)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('teacher'),
  formulaController.deleteFormula
);

module.exports = router;

