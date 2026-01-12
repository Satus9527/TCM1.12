/**
 * 个性化内容API输入验证规则
 */

const { body, param, validationResult } = require('express-validator');

/**
 * 验证结果处理中间件
 */
const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Bad Request',
      message: '请求参数验证失败',
      errors: errors.array(),
      path: req.originalUrl
    });
  }
  next();
};

/**
 * 验证添加收藏请求
 */
const validateAddCollection = [
  body('content_type')
    .isIn(['medicine', 'formula'])
    .withMessage('内容类型必须是 medicine 或 formula'),
  body('content_id')
    .isUUID()
    .withMessage('内容ID必须是有效的UUID格式'),
  handleValidationResult
];

/**
 * 验证保存模拟方案请求
 */
const validateSaveSimulation = [
  body('name')
    .notEmpty().withMessage('方案名称不能为空')
    .isString().withMessage('方案名称必须是字符串')
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('方案名称长度必须在1-200字符之间'),
  body('composition_data')
    .exists().withMessage('配方组成数据不能为空')
    .isObject().withMessage('配方组成数据必须是对象'),
  body('ai_analysis_data')
    .optional()
    .isObject().withMessage('AI分析数据必须是对象'),
  body('user_notes')
    .optional()
    .isString().withMessage('用户备注必须是字符串')
    .trim(),
  handleValidationResult
];

/**
 * 验证模拟方案ID参数
 */
const validateSimulationIdParam = [
  param('simulation_id')
    .isUUID()
    .withMessage('模拟方案ID必须是有效的UUID格式'),
  handleValidationResult
];

/**
 * 验证收藏ID参数
 */
const validateCollectionIdParam = [
  param('collection_id')
    .isUUID()
    .withMessage('收藏ID必须是有效的UUID格式'),
  handleValidationResult
];

/**
 * 验证文件ID参数
 */
const validateFileIdParam = [
  param('file_id')
    .isUUID()
    .withMessage('文件ID必须是有效的UUID格式'),
  handleValidationResult
];

/**
 * 验证保存文件元数据请求（内部接口）
 */
const validateSaveFileMeta = [
  body('user_id')
    .isUUID()
    .withMessage('用户ID必须是有效的UUID格式'),
  body('file_name')
    .notEmpty().withMessage('文件名不能为空')
    .isString().withMessage('文件名必须是字符串')
    .trim(),
  body('storage_url')
    .notEmpty().withMessage('存储URL不能为空')
    .isString().withMessage('存储URL必须是字符串'),
  body('file_type')
    .optional()
    .isString().withMessage('文件类型必须是字符串'),
  body('file_size')
    .optional()
    .isInt({ min: 0 }).withMessage('文件大小必须是非负整数'),
  body('uploaded_at')
    .optional()
    .isISO8601().withMessage('上传时间必须是ISO8601格式'),
  handleValidationResult
];

module.exports = {
  validateAddCollection,
  validateSaveSimulation,
  validateSimulationIdParam,
  validateCollectionIdParam,
  validateFileIdParam,
  validateSaveFileMeta
};

