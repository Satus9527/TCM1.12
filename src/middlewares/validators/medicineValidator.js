const { body } = require('express-validator');

/**
 * 创建/更新药材验证规则
 */
const medicineValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('药材名称长度必须在1-100个字符之间'),
  
  body('pinyin')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('拼音长度不能超过100个字符'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('分类长度不能超过50个字符'),
  
  body('nature')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('性味长度不能超过50个字符'),
  
  body('flavor')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('味长度不能超过50个字符'),
  
  body('meridian')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('归经长度不能超过100个字符'),
  
  body('usage_dosage')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('用法用量长度不能超过100个字符'),
  
  body('image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('图片URL格式不正确')
];

module.exports = {
  medicineValidation
};

