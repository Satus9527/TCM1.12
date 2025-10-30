/**
 * AI推荐路由
 * 
 * 路由定义：
 * - POST /api/recommend/formula - 获取方剂推荐
 */

const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { validateRecommendationRequest } = require('../middlewares/validators/recommendationValidator');
const recommendationController = require('../controllers/recommendationController');
const router = express.Router();

/**
 * @route   POST /api/recommend/formula
 * @desc    根据症状获取AI推荐方剂
 * @access  Private (需要JWT认证)
 * @body    {
 *            symptoms: string[],       // 必需：症状列表
 *            tongue_desc?: string,     // 可选：舌象描述
 *            user_profile?: {          // 可选：用户信息
 *              age?: number,
 *              gender?: string,
 *              height?: number,
 *              weight?: number,
 *              medical_history?: string[],
 *              allergies?: string[]
 *            }
 *          }
 * @returns {
 *            success: boolean,
 *            data: {
 *              recommendations: Array<{
 *                formula: Object,        // 方剂详细信息
 *                ai_analysis: Object,    // AI分析结果
 *                safety_check: Object    // 安全检查结果
 *              }>,
 *              total: number,
 *              has_safety_warnings: boolean
 *            }
 *          }
 */
router.post(
  '/formula',
  authenticateToken,                // 1. 认证中间件
  validateRecommendationRequest,    // 2. 输入验证中间件
  recommendationController.getRecommendation  // 3. 控制器处理
);

module.exports = router;

