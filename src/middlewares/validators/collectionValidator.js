const { body } = require('express-validator');

// 添加收藏验证
const addCollectionValidation = [
  body('formula_id')
    .notEmpty()
    .withMessage('方剂ID不能为空')
    .isUUID()
    .withMessage('方剂ID格式不正确'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('备注必须是字符串')
    .trim()
];

// 更新收藏备注验证
const updateNotesValidation = [
  body('notes')
    .notEmpty()
    .withMessage('备注不能为空')
    .isString()
    .withMessage('备注必须是字符串')
    .trim()
];

module.exports = {
  addCollectionValidation,
  updateNotesValidation
};

