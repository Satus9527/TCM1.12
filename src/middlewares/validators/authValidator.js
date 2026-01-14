const { body } = require('express-validator');

/**
 * 注册验证规则
 */
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  
  body('password')
    .isLength({ min: 6, max: 50 })
    .withMessage('密码长度必须在6-50个字符之间'),
  
  body('role')
    .isIn(['health_follower', 'student', 'teacher'])
    .withMessage('角色必须是 health_follower、student 或 teacher 之一'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('手机号格式不正确')
];

/**
 * 登录验证规则
 * 支持 username、email 或 phone 登录
 */
const loginValidation = [
  body('username')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('用户名不能为空'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('手机号格式不正确'),
  
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),
  
  // 自定义验证：username、email 或 phone 至少提供一个
  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.email && !req.body.phone) {
      throw new Error('必须提供用户名、邮箱或手机号');
    }
    return true;
  })
];

/**
 * 刷新令牌验证规则
 */
const refreshValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('刷新令牌不能为空')
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshValidation
};

