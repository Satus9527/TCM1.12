const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const { addCollectionValidation, updateNotesValidation } = require('../middlewares/validators/collectionValidator');

/**
 * 收藏管理路由
 * 允许 health_follower 和 student 角色访问
 */

/**
 * @route   GET /api/collections/stats
 * @desc    获取收藏统计
 * @access  Private (health_follower, student)
 */
router.get(
  '/stats',
  authenticateToken,
  authorizeRole(['health_follower', 'student']),
  collectionController.getCollectionStats
);

/**
 * @route   GET /api/collections/check/:formulaId
 * @desc    检查是否已收藏
 * @access  Private (health_follower, student)
 */
router.get(
  '/check/:formulaId',
  authenticateToken,
  authorizeRole(['health_follower', 'student']),
  collectionController.checkCollection
);

/**
 * @route   GET /api/collections
 * @desc    获取用户的收藏列表
 * @access  Private (health_follower, student)
 */
router.get(
  '/',
  authenticateToken,
  authorizeRole(['health_follower', 'student']),
  collectionController.getUserCollections
);

/**
 * @route   POST /api/collections
 * @desc    添加收藏
 * @access  Private (health_follower, student)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRole(['health_follower', 'student']),
  addCollectionValidation,
  collectionController.addCollection
);

/**
 * @route   PUT /api/collections/:formulaId
 * @desc    更新收藏备注
 * @access  Private (health_follower, student)
 */
router.put(
  '/:formulaId',
  authenticateToken,
  authorizeRole(['health_follower', 'student']),
  updateNotesValidation,
  collectionController.updateCollectionNotes
);

/**
 * @route   DELETE /api/collections/:formulaId
 * @desc    取消收藏
 * @access  Private (health_follower, student)
 */
router.delete(
  '/:formulaId',
  authenticateToken,
  authorizeRole(['health_follower', 'student']),
  collectionController.removeCollection
);

module.exports = router;

