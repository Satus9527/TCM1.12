/**
 * AI推荐 API 输入验证器
 * 
 * 验证 /api/recommend/formula 请求体：
 * - symptoms: 症状列表（必需，数组，至少1个元素）
 * - tongue_desc: 舌象描述（可选，字符串）
 * - user_profile: 用户信息（可选，对象）
 */

const { body, validationResult } = require('express-validator');

const validateRecommendationRequest = [
  // 1. 验证 'symptoms' 字段
  body('symptoms')
    .exists().withMessage('症状列表不能为空')
    .isArray({ min: 1 }).withMessage('症状列表必须是数组且至少包含一个症状')
    .bail() // 如果不是数组，则停止后续验证
    .custom((symptoms) => {
      // 确保数组元素都是非空字符串
      const isValid = symptoms.every(s => {
        return typeof s === 'string' && s.trim().length > 0;
      });
      if (!isValid) {
        throw new Error('症状列表中必须包含有效的文本描述');
      }
      return true;
    }),

  // 2. 验证 'tongue_desc' 字段 (可选)
  body('tongue_desc')
    .optional({ checkFalsy: true }) // 允许为空字符串或 null/undefined
    .isString().withMessage('舌象描述必须是文本')
    .trim()
    .isLength({ max: 500 }).withMessage('舌象描述不能超过500字符'),

  // 3. 验证 'user_profile' 字段 (可选)
  body('user_profile')
    .optional()
    .isObject().withMessage('用户信息必须是对象格式'),

  // 3.1 验证 age（如果提供）
  body('user_profile.age')
    .optional()
    .isInt({ min: 0, max: 150 }).withMessage('年龄必须是0-150之间的整数'),

  // 3.2 验证 gender（如果提供）
  body('user_profile.gender')
    .optional()
    .isIn(['male', 'female', 'other', '男', '女', '其他']).withMessage('性别信息无效'),

  // 3.3 验证 height（如果提供）
  body('user_profile.height')
    .optional()
    .isFloat({ min: 0, max: 300 }).withMessage('身高必须是有效数值（0-300cm）'),

  // 3.4 验证 weight（如果提供）
  body('user_profile.weight')
    .optional()
    .isFloat({ min: 0, max: 500 }).withMessage('体重必须是有效数值（0-500kg）'),

  // 3.5 验证 medical_history（如果提供）
  body('user_profile.medical_history')
    .optional()
    .isArray().withMessage('病史必须是数组格式'),

  // 3.6 验证 allergies（如果提供）
  body('user_profile.allergies')
    .optional()
    .isArray().withMessage('过敏史必须是数组格式'),

  // 4. 处理验证结果的中间件
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 如果有验证错误，返回 400 Bad Request
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: '请求参数验证失败',
        errors: errors.array().map(err => ({
          field: err.path || err.param,
          message: err.msg,
          value: err.value
        })),
        path: req.originalUrl
      });
    }

    // 验证通过，继续处理请求
    next();
  }
];

module.exports = { validateRecommendationRequest };

