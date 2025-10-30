const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
// const fileController = require('../controllers/fileController'); // TODO: 实现文件控制器

/**
 * 文件管理路由
 * 所有路由都需要认证，部分路由需要特定角色
 */

/**
 * @route   POST /api/files/upload
 * @desc    上传文件 (仅教师)
 * @access  Private (Teacher only)
 */
router.post(
  '/upload',
  authenticateToken,              // 1. 验证 Token 有效性
  authorizeRole('teacher'),        // 2. 检查角色是否为 'teacher'
  (req, res) => {                  // 3. 路由处理器 (临时实现)
    res.json({
      success: true,
      message: '文件上传接口 (仅教师可访问)',
      user: req.user
    });
  }
);

/**
 * @route   GET /api/files
 * @desc    获取教师的文件列表 (仅教师)
 * @access  Private (Teacher only)
 */
router.get(
  '/',
  authenticateToken,
  authorizeRole('teacher'),
  (req, res) => {
    res.json({
      success: true,
      message: '教师文件列表',
      user: req.user,
      files: [] // 示例数据
    });
  }
);

/**
 * @route   GET /api/files/:file_id
 * @desc    获取文件详情
 * @access  Private (所有认证用户)
 */
router.get(
  '/:file_id',
  authenticateToken,               // 所有认证用户都可以查看文件详情
  (req, res) => {
    res.json({
      success: true,
      message: '文件详情',
      user: req.user,
      file_id: req.params.file_id
    });
  }
);

/**
 * @route   DELETE /api/files/:file_id
 * @desc    删除文件 (仅教师)
 * @access  Private (Teacher only)
 */
router.delete(
  '/:file_id',
  authenticateToken,
  authorizeRole('teacher'),
  (req, res) => {
    res.json({
      success: true,
      message: '文件已删除',
      user: req.user,
      file_id: req.params.file_id
    });
  }
);

/**
 * @route   PUT /api/files/:file_id
 * @desc    更新文件信息 (仅教师)
 * @access  Private (Teacher only)
 */
router.put(
  '/:file_id',
  authenticateToken,
  authorizeRole('teacher'),
  (req, res) => {
    res.json({
      success: true,
      message: '文件信息已更新',
      user: req.user,
      file_id: req.params.file_id
    });
  }
);

module.exports = router;

