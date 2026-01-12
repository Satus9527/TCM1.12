/**
 * 文件上传和管理API路由
 * 专门供教师角色上传和管理文件
 */

const express = require('express');
const multer = require('multer');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const contentValidators = require('../middlewares/validators/contentValidator');
const fileController = require('../controllers/fileController');
const config = require('../../config');
const { isAllowedExtension, isAllowedMimeType } = require('../utils/fileUtils');

const router = express.Router();

// --- Multer 配置 ---
// 配置 multer 仅处理流，不保存到磁盘或内存

const uploadMiddleware = multer({
  // storage: ..., // 不指定 storage，multer 会使用内存存储
  limits: { fileSize: config.upload.maxFileSize }, // 从配置读取大小限制
  fileFilter: (req, file, cb) => {
    // 检查文件扩展名
    const extAllowed = isAllowedExtension(file.originalname, config.upload.allowedExtensions);
    
    // 检查MIME类型
    const mimeAllowed = isAllowedMimeType(file.mimetype, config.upload.allowedMimeTypes);

    if (extAllowed && mimeAllowed) {
      cb(null, true); // 接受文件
    } else {
      cb(new Error('不允许的文件类型，支持的格式：PDF、图片（JPG/PNG/GIF）、Office文档（DOC/DOCX/PPT/PPTX）、视频（MP4）'), false); // 拒绝文件
    }
  }
}).single('file'); // 'file' 是 multipart form 中文件字段的名称

// --- 路由定义 ---

/**
 * POST /api/files/upload
 * 上传文件（仅教师角色）
 * 认证：必需
 * 授权：teacher
 */
router.post(
  '/upload',
  authenticateToken,         // 1. 认证
  authorizeRole(['teacher']), // 2. 授权 (只有教师)
  (req, res, next) => {      // 3. Multer 中间件处理
    uploadMiddleware(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // Multer 错误 (e.g., 文件过大)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            timestamp: new Date().toISOString(),
            status: 400,
            error: 'Bad Request',
            message: `文件大小超过限制（最大 ${config.upload.maxFileSize / 1024 / 1024}MB）`,
            path: req.originalUrl
          });
        }
        return res.status(400).json({
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: `文件上传失败: ${err.message}`,
          path: req.originalUrl
        });
      } else if (err) {
        // 文件过滤器错误 (e.g., 不允许的文件类型)
        return res.status(400).json({
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: err.message || '不允许的文件类型',
          path: req.originalUrl
        });
      }
      // 文件流处理成功（或无文件），继续
      next();
    });
  },
  fileController.handleUpload // 4. 控制器处理上传逻辑
);

/**
 * GET /api/files
 * 获取用户文件列表（仅教师角色）
 * 认证：必需
 * 授权：teacher
 */
router.get(
  '/',
  authenticateToken,
  authorizeRole(['teacher']),
  fileController.listFiles
);

/**
 * DELETE /api/files/:file_id
 * 删除文件（仅教师角色）
 * 认证：必需
 * 授权：teacher
 */
router.delete(
  '/:file_id',
  authenticateToken,
  authorizeRole(['teacher']),
  contentValidators.validateFileIdParam,
  fileController.deleteFile
);

module.exports = router;
