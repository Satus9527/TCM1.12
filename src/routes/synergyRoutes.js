const express = require('express');
const router = express.Router();
const synergyController = require('../controllers/synergyController');
const authenticate = require('../middlewares/authenticate');

/**
 * @route   POST /api/synergy/calculate
 * @desc    计算药物功效协同度
 * @access  Public
 * @body    {
 *            medicineIds: string[]    // 必需：药物ID列表
 *          }
 * @returns {
 *            success: boolean,
 *            data: {
 *              synergy_score: string,  // 协同度分数（0-1）
 *              medicine_count: number,  // 药物数量
 *              synergy_level: string,   // 协同等级：高度协同、中度协同、低度协同、无协同
 *              analysis: string,        // 协同分析结果
 *              medicine_details: Array  // 药物详细信息及量化数据
 *            }
 *          }
 */
router.post('/calculate', synergyController.calculateSynergy);

/**
 * @route   POST /api/synergy/radar
 * @desc    获取功效协同雷达图数据
 * @access  Public
 * @body    {
 *            medicineIds: string[]    // 必需：药物ID列表
 *          }
 * @returns {
 *            success: boolean,
 *            data: {
 *              radar_data: number[],    // 雷达图数值数据
 *              categories: string[],    // 雷达图分类标签
 *              synergy_score: string,   // 协同度分数（0-1）
 *              synergy_level: string,    // 协同等级
 *              medicine_names: string[]  // 药物名称列表
 *            }
 *          }
 */
router.post('/radar', synergyController.getSynergyRadar);

module.exports = router;
