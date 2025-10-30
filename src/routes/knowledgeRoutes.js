const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * 知识库 API 路由
 * 所有路由都需要认证
 */

// 应用认证中间件到所有知识库路由
router.use(authenticateToken);

// ============ 药材相关路由 ============

/**
 * @route   GET /api/knowledge/medicines/search
 * @desc    搜索药材（按名称或拼音）
 * @access  Private
 * @query   q - 搜索关键词
 * @query   limit - 每页数量（默认 20）
 * @query   offset - 偏移量（默认 0）
 */
router.get('/medicines/search', knowledgeController.searchMedicines);

/**
 * @route   GET /api/knowledge/medicines/efficacy
 * @desc    按功效搜索药材
 * @access  Private
 * @query   q - 功效关键词
 * @query   limit - 每页数量（默认 20）
 * @query   offset - 偏移量（默认 0）
 */
router.get('/medicines/efficacy', knowledgeController.searchMedicinesByEfficacy);

/**
 * @route   GET /api/knowledge/medicines/:id
 * @desc    获取药材详情
 * @access  Private
 * @param   id - 药材 ID (UUID)
 */
router.get('/medicines/:id', knowledgeController.getMedicineById);

// ============ 方剂相关路由 ============

/**
 * @route   GET /api/knowledge/formulas/search
 * @desc    搜索方剂（按名称或拼音）
 * @access  Private
 * @query   q - 搜索关键词
 * @query   limit - 每页数量（默认 20）
 * @query   offset - 偏移量（默认 0）
 */
router.get('/formulas/search', knowledgeController.searchFormulas);

/**
 * @route   GET /api/knowledge/formulas/efficacy
 * @desc    按功效搜索方剂
 * @access  Private
 * @query   q - 功效关键词
 * @query   limit - 每页数量（默认 20）
 * @query   offset - 偏移量（默认 0）
 */
router.get('/formulas/efficacy', knowledgeController.searchFormulasByEfficacy);

/**
 * @route   GET /api/knowledge/formulas/:id
 * @desc    获取方剂详情（含组成药材）
 * @access  Private
 * @param   id - 方剂 ID (UUID)
 */
router.get('/formulas/:id', knowledgeController.getFormulaById);

module.exports = router;

