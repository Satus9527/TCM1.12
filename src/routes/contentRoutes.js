/**
 * 个性化内容API路由
 * 包括用户收藏、模拟方案和文件管理
 */

const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const contentValidators = require('../middlewares/validators/contentValidator');
const contentController = require('../controllers/contentController');

const router = express.Router();

// 所有 /api/content/* 路由都需要认证
router.use(authenticateToken);

// ===== 收藏管理 (Collections) =====

/**
 * POST /api/content/collections
 * 添加收藏（药材或方剂）
 * 权限：health_follower, student
 */
router.post(
  '/collections',
  authorizeRole(['health_follower', 'student']),
  contentValidators.validateAddCollection,
  contentController.addCollection
);

/**
 * GET /api/content/collections
 * 获取用户收藏列表
 * 权限：health_follower, student
 */
router.get(
  '/collections',
  authorizeRole(['health_follower', 'student']),
  contentController.getCollections
);

/**
 * DELETE /api/content/collections/:collection_id
 * 删除收藏
 * 权限：health_follower, student
 */
router.delete(
  '/collections/:collection_id',
  authorizeRole(['health_follower', 'student']),
  contentValidators.validateCollectionIdParam,
  contentController.deleteCollection
);

// ===== 模拟方案管理 (Simulations) =====

/**
 * POST /api/content/simulations/save
 * 保存模拟方案
 * 权限：health_follower, student
 */
router.post(
  '/simulations/save',
  authorizeRole(['health_follower', 'student']),
  contentValidators.validateSaveSimulation,
  contentController.saveSimulation
);

/**
 * GET /api/content/simulations
 * 获取用户模拟方案列表
 * 权限：health_follower, student
 */
router.get(
  '/simulations',
  authorizeRole(['health_follower', 'student']),
  contentController.getSimulations
);

/**
 * DELETE /api/content/simulations/:simulation_id
 * 删除模拟方案
 * 权限：health_follower, student
 */
router.delete(
  '/simulations/:simulation_id',
  authorizeRole(['health_follower', 'student']),
  contentValidators.validateSimulationIdParam,
  contentController.deleteSimulation
);

// ===== 文件管理 (Files) - 教师专用 =====

/**
 * POST /api/content/files/meta
 * 保存文件元数据（内部接口）
 * 注意：此接口应由文件上传服务调用，生产环境需要特殊认证
 */
router.post(
  '/files/meta',
  // 暂时使用普通认证，生产环境应使用内部服务认证
  contentValidators.validateSaveFileMeta,
  contentController.saveFileMeta
);

/**
 * GET /api/content/files
 * 获取教师文件列表
 * 权限：teacher
 */
router.get(
  '/files',
  authorizeRole('teacher'),
  contentController.getFiles
);

/**
 * DELETE /api/content/files/:file_id
 * 删除文件及其元数据
 * 权限：teacher
 */
router.delete(
  '/files/:file_id',
  authorizeRole('teacher'),
  contentValidators.validateFileIdParam,
  contentController.deleteFile
);

module.exports = router;

