const { body } = require('express-validator');

/**
 * 创建/更新方剂验证规则
 */
const formulaValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('方剂名称长度必须在1-100个字符之间'),
  
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
  
  body('source')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('出处长度不能超过100个字符'),
  
  body('compositions')
    .optional()
    .isArray()
    .withMessage('组成必须是数组'),
  
  body('compositions.*.medicine_id')
    .if(body('compositions').exists())
    .notEmpty()
    .withMessage('药材ID不能为空'),
  
  body('compositions.*.dosage')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('用量长度不能超过50个字符'),
  
  body('compositions.*.role')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('角色长度不能超过50个字符')
];

module.exports = {
  formulaValidation
};

